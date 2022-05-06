import ExpressService from "./framework-services/express";
import Config from "../config/config";
import RestifyService from "./framework-services/restify";
import HttpService from "./framework-services/plainhttp";
import ConnectService from "./framework-services/connect";
import { IFrameworkService } from "./interfaces";

export default class RequestAccessor {
    private static instance: RequestAccessor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = this.assignFrameworkService();
    }

    public static getInstance(): RequestAccessor {
        if (!RequestAccessor.instance) {
            RequestAccessor.instance = new RequestAccessor();
        }

        return RequestAccessor.instance;
    }

    // Binds the Loglevel extracted from JWT token to the given request logger
    public bindDynLogLevel() {

    };

    public getHeaderField(req: any, fieldName: string): any {
        return this.frameworkService.getReqHeaderField(req, fieldName);
    };

    public getField(req: any, fieldName: string): any {
        return this.frameworkService.getReqField(req, fieldName);
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
