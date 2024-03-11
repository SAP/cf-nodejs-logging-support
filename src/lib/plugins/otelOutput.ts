
import { logs as logsAPI, Logger, LoggerProvider, SeverityNumber } from '@opentelemetry/api-logs'
import { OutputPlugin } from './interfaces'
import { Record, RecordType } from '../logger/record'
import { Level } from '../logger/level'

export class OpenTelemetryLogsOutputPlugin implements OutputPlugin {
    private logger: Logger

    public constructor(loggerProvider?: LoggerProvider) {
        if (loggerProvider) {
            this.logger = loggerProvider.getLogger('default')
        } else {
            this.logger = logsAPI.getLoggerProvider().getLogger("default")
        }
    }

    public writeRecord(record: Record): void {
        if (record.metadata.type == RecordType.Request) {
            return // ignore request logs
        }

        let attributes = {} // additional attributes

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
}
