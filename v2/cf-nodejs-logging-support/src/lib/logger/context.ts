import Config from "../config/config";
import RequestAccessor from "../middleware/request-Accessor";

export default class ReqContext {
    private fields: any = {};
    private requestAccessor = RequestAccessor.getInstance();

    constructor(_req: any) {
        this.setFields(_req);
    }

    getProp(key: string) {
        return this.fields[key];
    }

    getFields(): any {
        return this.fields;
    }

    private setFields(_req: any) {
        const contextFields = Config.getInstance().getContextFields();

        contextFields.forEach(field => {
            if (!Array.isArray(field.source)) {
                switch (field.source.type) {
                    case "req-header":
                        this.fields[field.name] = this.requestAccessor.getHeaderField(_req, field.source.name!);
                        break;
                    case "req-object":
                        this.fields[field.name] = this.requestAccessor.getField(_req, field.source.name!);
                        break;
                }
            }

            // TO DO: sources as array case

        });
    }
}
