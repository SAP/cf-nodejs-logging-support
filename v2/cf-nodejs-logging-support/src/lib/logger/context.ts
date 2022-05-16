import Config from "../config/config";
import RequestAccessor from "../middleware/request-Accessor";

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
                switch (field.source.type) {
                    case "req-header":
                        this.properties[field.name] = this.requestAccessor.getHeaderField(req, field.source.name!);
                        break;
                    case "req-object":
                        this.properties[field.name] = this.requestAccessor.getField(req, field.source.name!);
                        break;
                }
            }

            // TO DO: sources as array case

        });
    }
}
