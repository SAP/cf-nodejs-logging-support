import ExpressService from "./framework-services/express";
import Config from "../config/config";
import RestifyService from "./framework-services/restify";
import HttpService from "./framework-services/plainhttp";
import ConnectService from "./framework-services/connect";
import { IFrameworkService } from "./interfaces";

export default class RequestAccesor {
    private static instance: RequestAccesor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = this.assignFrameworkService();
    }

    public static getInstance(): RequestAccesor {
        if (!RequestAccesor.instance) {
            RequestAccesor.instance = new RequestAccesor();
        }

        return RequestAccesor.instance;
    }

    // Binds the Loglevel extracted from JWT token to the given request logger
    public bindDynLogLevel() {

    };

    public getHeaderField(_req: any, _fieldName: string): any {
        return this.frameworkService.getReqHeaderField(_req, _fieldName);
    };

    public getField(_req: any, _fieldName: string): any {
        return this.frameworkService.getReqField(_req, _fieldName);
    };

    private assignFrameworkService(): IFrameworkService {
        const framework = Config.getInstance().getFramework();
        switch (framework) {
            //insert your custom framework logger here
            case "restify":
                return new RestifyService();
            case "nodejs-http":
                return new HttpService();
            case "connect":
                return new ConnectService();
            default:
                return new ExpressService();
        }
    }
}
