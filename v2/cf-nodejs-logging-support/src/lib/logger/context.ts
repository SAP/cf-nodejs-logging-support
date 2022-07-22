import Config from "../config/config";
import { SourceUtils } from "./source-utils";

export default class ReqContext {
    private properties: any = {};

    constructor(req: any) {
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

        const now = new Date();
        const contextFields = Config.getInstance().getContextFields();
        const sourceUtils = SourceUtils.getInstance();

        contextFields.forEach(field => {
            if (!Array.isArray(field.source)) {
                this.properties[field.name] = sourceUtils.getContextFieldValue(field.source, req);
            } else {
                this.properties[field.name] = sourceUtils.getValueFromSources(field, this.properties, "context", now, req);
            }
        });
    }
}
