import type { Context } from '@opentelemetry/api'
import { logs as logsAPI, Logger, LoggerProvider, SeverityNumber, LogAttributes} from '@opentelemetry/api-logs'
import { OutputPlugin } from './interfaces.js'
import { Record, RecordType } from '../logger/record.js'
import { Level } from '../logger/level.js'

/** @experimental Requires `@opentelemetry/api-logs`, which is itself experimental and subject to breaking changes. */
export type OpenTelemetryLogContextResolver = (record: Record) => Context | undefined

/** @experimental Requires `@opentelemetry/api-logs`, which is itself experimental and subject to breaking changes. */
export type OpenTelemetryLogContext = Context | OpenTelemetryLogContextResolver

/**
 * @experimental Used with {@link OpenTelemetryLogsOutputPlugin}, which is experimental.
 */
export enum FieldInclusionMode {
    AllFields = "all",
    CustomFieldsOnly = "custom-fields",
    None = "none"
}

/**
 * Output plugin that emits log records via the OpenTelemetry Logs API.
 *
 * @experimental This plugin depends on `@opentelemetry/api-logs`, which is marked as experimental
 * by the OpenTelemetry project and may introduce breaking changes in future releases.
 */
export class OpenTelemetryLogsOutputPlugin implements OutputPlugin {
    private logger: Logger
    private includeFieldsAsAttributes: FieldInclusionMode
    private context?: OpenTelemetryLogContext
    private emitRequestLogs: boolean

    /**
     * Constructs a new OpenTelemetryLogsOutputPlugin.
     * @param loggerProvider Optional OTel LoggerProvider to use. Defaults to the global provider.
     * @param context Optional OTel context or context resolver function to attach to emitted log records.
     */
    public constructor(loggerProvider?: LoggerProvider, context?: OpenTelemetryLogContext) {
        if (loggerProvider) {
            this.logger = loggerProvider.getLogger('default')
        } else {
            this.logger = logsAPI.getLoggerProvider().getLogger("default")
        }
        this.includeFieldsAsAttributes = FieldInclusionMode.CustomFieldsOnly
        this.context = context
        this.emitRequestLogs = false
    }

    /**
     * Sets the mode for including fields as attributes in emitted OTel log records.
     * @param includeFieldsAsAttributes The field inclusion mode to use.
     */
    public setIncludeFieldsAsAttributes(includeFieldsAsAttributes: FieldInclusionMode) {
        this.includeFieldsAsAttributes = includeFieldsAsAttributes
    }

    /**
     * Controls whether request logs are emitted as OTel log records in addition to message logs.
     * @param enabled Whether request logs should be emitted. Defaults to false.
     */
    public setEmitRequestLogs(enabled: boolean) {
        this.emitRequestLogs = enabled
    }

    /**
     * Writes a log record to the output plugin. Request logs are ignored unless enabled via
     * {@link setEmitRequestLogs}; message logs are always emitted.
     * @param record The log record to write.
     */
    public writeRecord(record: Record): void {
        if (record.metadata.type == RecordType.Request && !this.emitRequestLogs) {
            return
        }

        const attributes = {} as LogAttributes
        this.populateExceptionAttributes(record, attributes)
        this.populateAdditionalAttributes(record, attributes)

        const severityNumber = this.mapLevelToSeverityNumber(record.metadata.level)
        const context = this.resolveContext(record)

        this.logger.emit({
            severityNumber: severityNumber,
            severityText: SeverityNumber[severityNumber],
            body: this.resolveBody(record),
            attributes: attributes,
            ...(context && { context })
        })
    }

    /**
     * Resolves the OTel log body. Message logs use their message; request logs, which have none,
     * use a short summary of common request fields, falling back to "request".
     */
    private resolveBody(record: Record): string | undefined {
        if (record.metadata.type != RecordType.Request) {
            return record.metadata.message
        }
        const { method, request, response_status } = record.payload
        const summary = [method, request, response_status].filter(part => part !== undefined).join(" ")
        return summary.length > 0 ? summary : "request"
    }

    private resolveContext(record: Record): Context | undefined {
        if (typeof this.context === 'function') {
            return this.context(record)
        }
        return this.context
    }

    private mapLevelToSeverityNumber(level: Level): SeverityNumber {
        switch (level) {
            case Level.Error:
                return SeverityNumber.ERROR
            case Level.Warn:
                return SeverityNumber.WARN
            case Level.Info:
                return SeverityNumber.INFO
            case Level.Verbose:
                return SeverityNumber.DEBUG2
            case Level.Debug:
                return SeverityNumber.DEBUG
            case Level.Silly:
                return SeverityNumber.TRACE
        }
        return SeverityNumber.UNSPECIFIED
    }

    private populateExceptionAttributes(record: Record, attributes: LogAttributes) {
        if (record.metadata.errorName) {
            attributes["exception.type"] = record.metadata.errorName
        }
        if (record.metadata.errorMessage) {
            attributes["exception.message"] = record.metadata.errorMessage
        }
        if (record.metadata.rawStacktrace) {
            attributes["exception.stacktrace"] = record.metadata.rawStacktrace
        }
    }

    private populateAdditionalAttributes(record: Record, attributes: LogAttributes) {
        switch(this.includeFieldsAsAttributes) {
            case FieldInclusionMode.AllFields:
                for (const key in record.payload) {
                    attributes[key] = record.payload[key]
                }
            break;
            case FieldInclusionMode.CustomFieldsOnly:
                for (const key of record.metadata.customFieldNames) {
                    if (record.payload[key] !== undefined) {
                        attributes[key] = record.payload[key]
                    }
                }
            break;
            case FieldInclusionMode.None:
            default:
                return;
        }
    }
}

