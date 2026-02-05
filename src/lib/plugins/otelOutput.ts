
import { logs as logsAPI, Logger, LoggerProvider, SeverityNumber, LogAttributes} from '@opentelemetry/api-logs'
import { OutputPlugin } from './interfaces'
import { Record, RecordType } from '../logger/record'
import { Level } from '../logger/level'

export class OpenTelemetryLogsOutputPlugin implements OutputPlugin {
    private logger: Logger
    private includeFieldsAsAttributes: FieldInclusionMode

    public constructor(loggerProvider?: LoggerProvider) {
        if (loggerProvider) {
            this.logger = loggerProvider.getLogger('default')
        } else {
            this.logger = logsAPI.getLoggerProvider().getLogger("default")
        }
        this.includeFieldsAsAttributes = FieldInclusionMode.CustomFieldsOnly
    }

    public setIncludeFieldsAsAttributes(includeFieldsAsAttributes: FieldInclusionMode) {
        this.includeFieldsAsAttributes = includeFieldsAsAttributes
    }

    public writeRecord(record: Record): void {
        if (record.metadata.type == RecordType.Request) {
            return // ignore request logs
        }

        let attributes = {} as LogAttributes
        this.populateExceptionAttributes(record, attributes)
        this.populateAdditionalAttributes(record, attributes)

        let severityNumber = this.mapLevelToSeverityNumber(record.metadata.level)

        this.logger.emit({
            severityNumber: severityNumber,
            severityText: SeverityNumber[severityNumber],
            body: record.metadata.message,
            attributes: attributes
        })
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
                for (let key in record.payload) {
                    attributes[key] = record.payload[key]
                }
            break;
            case FieldInclusionMode.CustomFieldsOnly:
                for (let key of record.metadata.customFieldNames) {
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

export enum FieldInclusionMode {
    AllFields = "all",
    CustomFieldsOnly = "custom-fields",
    None = "none"
}
