import { Level } from "./level"

export class Record {
    payload: { [key: string]: any }
    metadata: RecordMetadata

    constructor(type: RecordType, level: Level) {
        this.payload = {}
        this.metadata = new RecordMetadata(type, level)
    }
}

export class RecordMetadata {
    type: RecordType
    level: Level
    message?: string
    rawStacktrace?: string
    stacktrace?: string[]
    errorName?: string
    errorMessage?: string
    customFieldNames: string[]

    constructor(type: RecordType, level: Level) {
        this.type = type
        this.level = level
        this.customFieldNames = new Array<string>()
    }
}

export type RecordFieldValue = string | string[] | number | boolean

export enum RecordType {
    Request, Message
}
