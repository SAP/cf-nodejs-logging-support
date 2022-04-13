export default class RequestController {
    private req: any;

    constructor(_req: any) {
        this.req = this.deepObject(_req);

    }

    private deepObject<T>(source: T) {
        const result = {} as T;
        Object.keys(source).forEach((key) => {
            const value = source[key as keyof T];
            result[key as keyof T] = value;
        });
        return result as T;
    }

    public fillReq() {
        // if (req.connection == null) {
        //     req.connection = {};
        // }
        // if (req.headers == null) {
        //     req.headers = {};
        // }

        // return req;
        // switch (this.effectiveLogger) {
        //     case "restify":
        //         return RestifyService.fillReq(req);
        //     case "connect":
        //         return ConnectService.fillReq(req);
        //     case "plainhttp":
        //         return HttpService.fillReq(req);
        //     default:
        //         return ExpressService.fillReq(req);
        // }
    }

    // Adds a logger instance to the provided request and assigns all required fields and api methods
    public bindLoggerToRequest(logObject: any) {
        this.req.logger = logObject;
    };

    // Binds the Loglevel extracted from JWT token to the given request logger
    public bindDynLogLevel() {

    };
}
