import Config from "../config/config";
import { ConfigField, outputs } from "../config/interfaces";
import { REDACTED_PLACEHOLDER } from "./record-factory";
import { SourceUtils } from "./source-utils";

export default class CacheFactory {

    private static instance: CacheFactory;
    private config: Config;
    private sourceUtils: SourceUtils;

    private constructor() {
        this.config = Config.getInstance();
        this.sourceUtils = SourceUtils.getInstance();
    }

    public static getInstance(): CacheFactory {
        if (!CacheFactory.instance) {
            CacheFactory.instance = new CacheFactory();
        }

        return CacheFactory.instance;
    }

    createCache(output: outputs, req?: any, res?: any): any {
        const writtenAt = new Date();

        let cachedFields: ConfigField[];
        if (output == "msg-log") {
            cachedFields = this.config.getCacheMsgFields();
        } else {
            cachedFields = this.config.getCacheReqFields();
        }

        let cache: any = {};
        cachedFields.forEach(
            field => {
                if (!Array.isArray(field.source)) {
                    if (output == "msg-log") {
                        cache[field.name] = this.sourceUtils.getFieldValue(field.source, cache, writtenAt);
                    } else {
                        cache[field.name] = this.sourceUtils.getReqFieldValue(field.source, cache, writtenAt, req, res);
                    }
                } else {
                    const value = this.sourceUtils.getValueFromSources(field, cache, output, writtenAt, req, res);

                    if (value != null) {
                        cache[field.name] = value;
                    }
                }

                // Handle default
                if (cache[field.name] == null && field.default != null) {
                    cache[field.name] = field.default;
                }

                // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
                if (field._meta!.isRedacted == true && cache[field.name] != null && cache[field.name] != field.default) {
                    cache[field.name] = REDACTED_PLACEHOLDER;
                }
            }
        );
        return cache;
    }

}
