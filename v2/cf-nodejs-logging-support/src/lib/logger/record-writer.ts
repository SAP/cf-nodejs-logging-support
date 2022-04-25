const os = require("os");

export default class RecordWriter {

    private static customSinkFunction: Function;

    static writeLog(_record: object): void {
        if (RecordWriter.customSinkFunction) {
            RecordWriter.customSinkFunction();
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(_record) + os.EOL);
        }
    }

    static setSinkFunction(f: Function) {
        RecordWriter.customSinkFunction = f;
    }
}
