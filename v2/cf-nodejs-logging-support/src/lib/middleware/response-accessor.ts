import ExpressService from "./framework-services/express";
import Config from "../config/config";
import RestifyService from "./framework-services/restify";
import HttpService from "./framework-services/plainhttp";
import ConnectService from "./framework-services/connect";
import { IFrameworkService } from "./interfaces";

export default class ResponseAccesor {
    private static instance: ResponseAccesor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = this.assignFrameworkService();
    }

    public static getInstance(): ResponseAccesor {
        if (!ResponseAccesor.instance) {
            ResponseAccesor.instance = new ResponseAccesor();
        }
        return ResponseAccesor.instance;
    }

    public getHeaderField(_req: any, _fieldName: string) {
        return this.frameworkService.getResHeaderField(_req, _fieldName);
    };

    public getField(_req: any, _fieldName: string) {
        return this.frameworkService.getResField(_req, _fieldName);
    };

    public finishLog(record: any) {
        return this.frameworkService.finishLog(record);
    }

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
