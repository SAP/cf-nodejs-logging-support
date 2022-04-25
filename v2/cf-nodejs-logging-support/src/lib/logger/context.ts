export default class ReqContext {
    public props = new Map();

    constructor() {
    }

    getRequest_Id() {
        return this.props.get("request_id");
    }

    getTenantId() {
        return this.props.get("tenant_id");
    }

    getCorrelationId() {
        return this.props.get("correlation_id");
    }

    getSubdomainId() {
        return this.props.get("tenant_id");
    }

    getProp(key: string) {
        this.props.get(key);
    }

    addProp(key: string, value: string) {
        this.props.set(key, value);
    }
}
