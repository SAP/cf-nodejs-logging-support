import { ConfigField } from '../config/interfaces';
export default class Cache {
    private static instance;
    private sourceUtils;
    private cacheMsgRecord;
    private cacheReqRecord;
    private shouldUpdateMsg;
    private shouldUpdateReq;
    private constructor();
    static getInstance(): Cache;
    getCacheMsgRecord(cacheFields: ConfigField[]): any;
    getCacheReqRecord(cacheFields: ConfigField[], req: any, res: any): any;
    markDirty(): void;
    private updateCache;
}
