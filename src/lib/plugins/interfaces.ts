import { Record } from "../logger/record"

// Interface for output plugins that handle log records.
export interface OutputPlugin {
    // Writes a log record to the output plugin. Implementations should handle the record appropriately.
    writeRecord(record: Record): void
}
