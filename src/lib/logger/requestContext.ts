import Config from '../config/config';
import { Output } from '../config/interfaces';
import SourceUtils from './sourceUtils';

export default class RequestContext {
    private properties: any = {};
    private config: Config;
    private sourceUtils: SourceUtils;

    constructor(req: any) {
        this.config = Config.getInstance();
        this.sourceUtils = SourceUtils.getInstance();
        this.assignProperties(req);
    }

    getProperty(key: string): string | undefined {
        return this.properties[key];
    }

    getProperties(): any {
        return this.properties;
    }

    setProperty(key: string, value: string) {
        this.properties[key] = value;
    }

    private assignProperties(req: any) {
        const contextFields = this.config.getContextFields();
        contextFields.forEach(field => {
            this.properties[field.name] = this.sourceUtils.getValue(field, this.properties, Output.ReqLog, req, null);
        });
    }
}
