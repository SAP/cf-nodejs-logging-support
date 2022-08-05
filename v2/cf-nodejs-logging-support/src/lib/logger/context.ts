import Config from "../config/config";
import { SourceUtils } from "./source-utils";

export default class ReqContext {
    private properties: any = {};
    private config: Config;
    private sourceUtils: SourceUtils;
    constructor(req: any) {
        this.config = Config.getInstance();
        this.sourceUtils = SourceUtils.getInstance();

        this.setProperties(req);
    }

    getProp(key: string) {
        return this.properties[key];
    }

    getProps(): any {
        return this.properties;
    }

    setProp(key: string, value: string) {
        this.properties[key] = value;
    }

    private setProperties(req: any) {

        const writtenAt = new Date();
        const contextFields = this.config.getContextFields();

        contextFields.forEach(field => {
            // if (!Array.isArray(field.source)) {
            //     this.properties[field.name] = sourceUtils.getContextFieldValue(field.source, req);
            // } else {
            this.properties[field.name] = this.sourceUtils.getValueFromSources(field, this.properties, "context", writtenAt, req);
            // }
        });
    }
}
