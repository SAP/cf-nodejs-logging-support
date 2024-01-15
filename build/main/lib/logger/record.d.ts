import { Level } from "./level";
export declare class Record {
    payload: {
        [key: string]: any;
    };
    metadata: RecordMetadata;
    constructor(type: RecordType, level: Level);
}
export declare class RecordMetadata {
    type: RecordType;
    level: Level;
    message?: string;
    stacktrace?: string[];
    constructor(type: RecordType, level: Level);
}
export type RecordFieldValue = string | string[] | number | boolean;
export declare enum RecordType {
    Request = 0,
    Message = 1
}
