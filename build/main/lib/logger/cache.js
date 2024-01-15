"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../config/interfaces");
const sourceUtils_1 = __importDefault(require("./sourceUtils"));
class Cache {
    constructor() {
        this.sourceUtils = sourceUtils_1.default.getInstance();
        this.shouldUpdateMsg = true;
        this.shouldUpdateReq = true;
    }
    static getInstance() {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }
    getCacheMsgRecord(cacheFields) {
        if (this.shouldUpdateMsg) {
            this.updateCache(interfaces_1.Output.MsgLog, cacheFields);
            this.shouldUpdateMsg = false;
        }
        return this.cacheMsgRecord;
    }
    getCacheReqRecord(cacheFields, req, res) {
        if (this.shouldUpdateReq) {
            this.updateCache(interfaces_1.Output.ReqLog, cacheFields, req, res);
            this.shouldUpdateReq = false;
        }
        return this.cacheReqRecord;
    }
    markDirty() {
        this.shouldUpdateMsg = true;
        this.shouldUpdateReq = true;
    }
    updateCache(output, cacheFields, req, res) {
        let cache = {};
        if (output == interfaces_1.Output.MsgLog) {
            this.cacheMsgRecord = {};
            cache = this.cacheMsgRecord;
        }
        else {
            this.cacheReqRecord = {};
            cache = this.cacheReqRecord;
        }
        // build cache
        cacheFields.forEach(field => {
            cache[field.name] = this.sourceUtils.getValue(field, cache, output, req, res);
        });
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map