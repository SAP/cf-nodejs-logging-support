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
    writeLog(records: any): void {
        const instance = RecordWriter.getInstance();
        if (instance.customSinkFunction) {
            instance.customSinkFunction(records.level, JSON.stringify(records));
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(records) + os.EOL);
        }
    }

    setSinkFunction(f: Function) {
        RecordWriter.getInstance().customSinkFunction = f;
    }
}
