import RootLogger from "../logger/root-logger";

export default class RequestAccesor {
    private req: any;
    public logger = new RootLogger();
    // private request_id: any;
    // private tenantId: any;
    // private correlationId: any;
    // private subdomainId: any;

    constructor(_req: any) {
        this.req = _req;
        this.req.logger = new RootLogger();
    }

    // Binds the Loglevel extracted from JWT token to the given request logger
    public bindDynLogLevel() {

    };
}
