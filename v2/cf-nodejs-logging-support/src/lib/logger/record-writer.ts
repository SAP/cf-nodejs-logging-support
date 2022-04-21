import Config from '../config/config';
import Level from "./level";
const os = require("os");

export default class RecordWriter {

    private static customSinkFunction: Function;

    static writeLog(_logObject: object): void {
        const config = Config.getInstance().getConfig()!;;
        if (RecordWriter.customSinkFunction) {
            RecordWriter.customSinkFunction();
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(_logObject) + os.EOL);
        }
    }

    static setSinkFunction(f: Function) {
        RecordWriter.customSinkFunction = f;
    }
}
