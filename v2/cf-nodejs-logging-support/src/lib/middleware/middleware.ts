// import ExpressService from './framework-services/express';
// import HttpService from './framework-services/plainhttp';
// import RestifyService from './framework-services/restify';
// import ConnectService from './framework-services/connect';

import { resolve } from "path";
import Config from "../config/config";
import LogFactory from "../logger/log-factory";
import RequestController from "./request";

interface IMiddleware {
    logNetwork: (req: any, res: any, next?: any) => void
}

export default class Middleware implements IMiddleware {

    constructor() {
    }

    public logNetwork(_req: any, _res: any, next?: any) {
        let req = new RequestController(_req);

        // record statt log?
        let logObject = LogFactory.build(req);

        req.bindLoggerToRequest(logObject);

        req.bindDynLogLevel();

        _res.on("finish", this.finishLog);

        _res.on("header", this.finishLog);

        next ? next() : null;
    }

    private finishLog() {
        res.bindLoggerToResponse(logObject);
    }
}
