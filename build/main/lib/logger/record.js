"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordType = exports.RecordMetadata = exports.Record = void 0;
class Record {
    constructor(type, level) {
        this.payload = {};
        this.metadata = new RecordMetadata(type, level);
    }
}
exports.Record = Record;
class RecordMetadata {
    constructor(type, level) {
        this.type = type;
        this.level = level;
    }
}
exports.RecordMetadata = RecordMetadata;
var RecordType;
(function (RecordType) {
    RecordType[RecordType["Request"] = 0] = "Request";
    RecordType[RecordType["Message"] = 1] = "Message";
})(RecordType || (exports.RecordType = RecordType = {}));
//# sourceMappingURL=record.js.map