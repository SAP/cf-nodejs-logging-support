import { LoggerProvider } from '@opentelemetry/api-logs';
import { OutputPlugin } from './interfaces';
import { Record } from '../logger/record';
export declare class OpenTelemetryLogsOutputPlugin implements OutputPlugin {
    private logger;
    constructor(loggerProvider?: LoggerProvider);
    writeRecord(record: Record): void;
    private mapLevelToSeverityNumber;
}
