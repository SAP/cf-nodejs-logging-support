import { Record } from "../logger/record";
export interface OutputPlugin {
    writeRecord(record: Record): void;
}
