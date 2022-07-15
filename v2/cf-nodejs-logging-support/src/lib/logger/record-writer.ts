const os = require("os");

export default class RecordWriter {

    private static instance: RecordWriter;
    private customSinkFunction: Function | undefined;

    private constructor() {
    }

    public static getInstance(): RecordWriter {
        if (!RecordWriter.instance) {
            RecordWriter.instance = new RecordWriter();
        }

        return RecordWriter.instance;
    }

    writeLog(record: any): void {
        const level = record["level"];
        const instance = RecordWriter.getInstance();
        if (instance.customSinkFunction) {
            instance.customSinkFunction(level, record);
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(record) + os.EOL);
        }
    }

    setSinkFunction(f: Function) {
        RecordWriter.getInstance().customSinkFunction = f;
    }
}
