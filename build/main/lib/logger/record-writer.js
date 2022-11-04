"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
class RecordWriter {
    constructor() {
    }
    static getInstance() {
        if (!RecordWriter.instance) {
            RecordWriter.instance = new RecordWriter();
        }
        return RecordWriter.instance;
    }
    writeLog(record) {
        const level = record["level"];
        if (this.customSinkFunction) {
            this.customSinkFunction(level, JSON.stringify(record));
        }
        else {
            // default to stdout
            process.stdout.write(JSON.stringify(record) + os.EOL);
        }
    }
    setSinkFunction(f) {
        this.customSinkFunction = f;
    }
}
exports.default = RecordWriter;
//# sourceMappingURL=record-writer.js.map