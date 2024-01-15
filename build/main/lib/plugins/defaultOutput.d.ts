import { Record } from "../logger/record";
import { OutputPlugin } from "./interfaces";
export declare class DefaultOutput implements OutputPlugin {
    private sinkFunction;
    writeRecord(record: Record): void;
    setSinkFunction(callback: (level: string, payload: string) => any | undefined): void;
}
