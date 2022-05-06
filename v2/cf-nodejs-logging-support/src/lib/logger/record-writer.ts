const os = require("os");

export default class RecordWriter {

    private static customSinkFunction: Function;

    static writeLog(records: object): void {
        if (RecordWriter.customSinkFunction) {
            RecordWriter.customSinkFunction();
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(records) + os.EOL);
        }
    }

    static setSinkFunction(f: Function) {
        RecordWriter.customSinkFunction = f;
    }
}
