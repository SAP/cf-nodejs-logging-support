"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const triple_beam_1 = __importDefault(require("triple-beam"));
const winston_transport_1 = __importDefault(require("winston-transport"));
class CfNodejsLoggingSupportLogger extends winston_transport_1.default {
    constructor(options) {
        super(options);
        this.level = options.level || "info";
        this.logger = options.rootLogger;
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        if (info[triple_beam_1.default.SPLAT]) {
            this.logger.logMessage.apply(this.logger, [info.level, info.message, ...info[triple_beam_1.default.SPLAT]]);
        }
        else {
            this.logger.logMessage(info.level, info.message);
        }
        callback();
    }
}
function createTransport(options) {
    return new CfNodejsLoggingSupportLogger(options);
}
exports.default = createTransport;
//# sourceMappingURL=winstonTransport.js.map