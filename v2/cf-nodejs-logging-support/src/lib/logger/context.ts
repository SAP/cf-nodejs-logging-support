import Config from "../config/config";
import { Source } from "../config/interfaces";
import RequestAccessor from "../middleware/request-Accessor";
import { SourceUtils } from "./source-utils";
const { v4: uuid } = require('uuid');

export default class ReqContext {
    private properties: any = {};
    private requestAccessor = RequestAccessor.getInstance();

    constructor(req: any) {
        this.setProperties(req);
    }

    getProp(key: string) {
        return this.properties[key];
    }

    getProps(): any {
        return this.properties;
    }

    private setProperties(req: any) {
        const contextFields = Config.getInstance().getContextFields();

        contextFields.forEach(field => {
            if (!Array.isArray(field.source)) {
                this.properties[field.name] = this.getPropValue(field.source, req);
            } else {
                let sourceIndex = SourceUtils.getNextValidSourceIndex(field.source);
                while (!this.properties[field.name] && sourceIndex != -1) {
                    let source = field.source[sourceIndex];
                    this.properties[field.name] = this.getPropValue(source, req);
                    sourceIndex = SourceUtils.getNextValidSourceIndex(field.source, ++sourceIndex);
                }
            }
        });
    }

    private getPropValue(source: Source, req: any) {
        switch (source.type) {
            case "req-header":
                return this.requestAccessor.getHeaderField(req, source.name!);
            case "req-object":
                return this.requestAccessor.getField(req, source.name!);
            case "uuid":
                return uuid();
        }
    }
}
