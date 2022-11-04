export default class RecordWriter {
    private static instance;
    private customSinkFunction;
    private constructor();
    static getInstance(): RecordWriter;
    writeLog(record: any): void;
    setSinkFunction(f: Function): void;
}
