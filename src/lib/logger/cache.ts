import { ConfigField, outputs } from "../config/interfaces";
import { SourceUtils } from "./sourceUtils";

export default class Cache {

    private static instance: Cache;
    private sourceUtils: SourceUtils;
    private cacheMsgRecord: any;
    private cacheReqRecord: any;
    private shouldUpdateMsg: boolean;
    private shouldUpdateReq: boolean;

    private constructor() {
        this.sourceUtils = SourceUtils.getInstance();
        this.shouldUpdateMsg = true;
        this.shouldUpdateReq = true;
    }

    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }

        return Cache.instance;
    }

    getCacheMsgRecord(cacheFields: ConfigField[]): any {
        if (this.shouldUpdateMsg) {
            this.updateCache("msg-log", cacheFields);
            this.shouldUpdateMsg = false;
        }
        return this.cacheMsgRecord;
    }

    getCacheReqRecord(cacheFields: ConfigField[], req: any, res: any): any {
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

    private updateCache(output: outputs, cacheFields: ConfigField[], req?: any, res?: any) {
        let cache: any = {};

        if (output == "msg-log") {
            this.cacheMsgRecord = {};
            cache = this.cacheMsgRecord;
        } else {
            this.cacheReqRecord = {};
            cache = this.cacheReqRecord;
        }

        // build cache
        cacheFields.forEach(
            field => {
                cache[field.name] = this.sourceUtils.getValue(field, cache, output, 0, req, res);
            }
        );
    }

}
