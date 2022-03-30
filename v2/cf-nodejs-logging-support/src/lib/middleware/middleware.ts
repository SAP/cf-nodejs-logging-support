import ExpressService from './framework-services/express';
import HttpService from './framework-services/plainhttp';
import RestifyService from './framework-services/restify';
import ConnectService from './framework-services/connect';

interface IMiddleware {
    logNetwork: (req: any, res: any, next?: any) => void
    forceLogger: (logger: string) => void
}

export default class Middleware implements IMiddleware {

    private effectiveLogger: string;

    constructor() {
        this.effectiveLogger = "express";
    }

    public logNetwork(req: any, res: any, next?: any) {

        if (req.connection == null) {
            req.connection = {};
        }
        if (req.headers == null) {
            req.headers = {};
        }

        req = this.fillReq(req);

        if (this.effectiveLogger == "express") {
            res = ExpressService.fillRes(res);
        }

        let logObject = this.buildLogObject(req);

        // could be included inside buildLogObject()
        this.reduceFields(logObject);

        this.bindLoggerToRequest(req, logObject);

        this.bindDynLogLevel(req);

        res.on("finish", this.finishLog);

        res.on("header", this.finishLog);

        next ? next() : null;
    }

    public forceLogger(logger: string) {
        this.effectiveLogger = logger;
    }

    private fillReq(req: any) {
        switch (this.effectiveLogger) {
            case "restify":
                return RestifyService.fillReq(req);
            case "connect":
                return ConnectService.fillReq(req);
            case "plainhttp":
                return HttpService.fillReq(req);
            default:
                return ExpressService.fillReq(req);
        }
    }

    // init a new log object and assign fields
    private buildLogObject(req: any): Object {
        return {};
    }

    // Replace all set fields, which are marked to be reduced, with a placeholder (defined in log-core.js)
    private reduceFields(logObject: Object) {

    }

    // Adds a logger instance to the provided request and assigns all required fields and api methods
    private bindLoggerToRequest(req: any, logObject: any) {

    };

    // Binds the Loglevel extracted from JWT token to the given request logger
    private bindDynLogLevel(req: any) {

    };

    private finishLog() {

    }
}
