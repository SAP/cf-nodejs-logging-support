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

        const contextFields = this.config.getContextFields();

        contextFields.forEach(field => {
            this.properties[field.name] = this.sourceUtils.getValue(field, this.properties, "context", 0, req);
        });
    }
}
