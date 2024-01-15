"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenTelemetryLogsOutputPlugin = void 0;
const api_logs_1 = require("@opentelemetry/api-logs");
const record_1 = require("../logger/record");
const level_1 = require("../logger/level");
class OpenTelemetryLogsOutputPlugin {
    constructor(loggerProvider) {
        if (loggerProvider) {
            this.logger = loggerProvider.getLogger('default');
        }
        else {
            this.logger = api_logs_1.logs.getLoggerProvider().getLogger("default");
        }
    }
    writeRecord(record) {
        if (record.metadata.type == record_1.RecordType.Request) {
            return; // ignore request logs
        }
        let attributes = {}; // additional attributes
        let severityNumber = this.mapLevelToSeverityNumber(record.metadata.level);
        this.logger.emit({
            severityNumber: severityNumber,
            severityText: api_logs_1.SeverityNumber[severityNumber],
            body: record.metadata.message,
            attributes: attributes
        });
    }
    mapLevelToSeverityNumber(level) {
        switch (level) {
            case level_1.Level.Error:
                return api_logs_1.SeverityNumber.ERROR;
            case level_1.Level.Warn:
                return api_logs_1.SeverityNumber.WARN;
            case level_1.Level.Info:
                return api_logs_1.SeverityNumber.INFO;
            case level_1.Level.Verbose:
            case level_1.Level.Debug:
                return api_logs_1.SeverityNumber.DEBUG;
            case level_1.Level.Silly:
                return api_logs_1.SeverityNumber.TRACE;
        }
        return api_logs_1.SeverityNumber.UNSPECIFIED;
    }
}
exports.OpenTelemetryLogsOutputPlugin = OpenTelemetryLogsOutputPlugin;
//# sourceMappingURL=otelOutput.js.map