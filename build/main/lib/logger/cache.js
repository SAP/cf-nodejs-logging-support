"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const source_utils_1 = require("./source-utils");
class Cache {
    constructor() {
        this.sourceUtils = source_utils_1.SourceUtils.getInstance();
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
            this.updateCache("msg-log", cacheFields);
            this.shouldUpdateMsg = false;
        }
        return this.cacheMsgRecord;
    }
    getCacheReqRecord(cacheFields, req, res) {
        if (this.shouldUpdateReq) {
            this.updateCache("req-log", cacheFields, req, res);
            this.shouldUpdateReq = false;
        }
        return this.cacheReqRecord;
    }
    markCacheDirty() {
        this.shouldUpdateMsg = true;
        this.shouldUpdateReq = true;
    }
    updateCache(output, cacheFields, req, res) {
        const writtenAt = new Date();
        let cache = {};
        if (output == "msg-log") {
            this.cacheMsgRecord = {};
            cache = this.cacheMsgRecord;
        }
        else {
            this.cacheReqRecord = {};
            cache = this.cacheReqRecord;
        }
        // build cache
        cacheFields.forEach(field => {
            cache[field.name] = this.sourceUtils.getValue(field, cache, output, writtenAt, req, res);
        });
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.js.map