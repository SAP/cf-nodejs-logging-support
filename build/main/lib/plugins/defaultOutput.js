"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultOutput = void 0;
const os_1 = __importDefault(require("os"));
const level_1 = require("../logger/level");
class DefaultOutput {
    writeRecord(record) {
        let jsonStr = JSON.stringify(record.payload);
        if (this.sinkFunction) {
            let level = level_1.LevelUtils.getName(record.metadata.level);
            this.sinkFunction(level, jsonStr);
        }
        else {
            process.stdout.write(jsonStr + os_1.default.EOL);
        }
    }
    setSinkFunction(callback) {
        this.sinkFunction = callback;
    }
}
exports.DefaultOutput = DefaultOutput;
//# sourceMappingURL=defaultOutput.js.map