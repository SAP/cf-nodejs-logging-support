import ExpressService from "./framework-services/express";
import Config from "../config/config";
import RestifyService from "./framework-services/restify";
import HttpService from "./framework-services/plainhttp";
import ConnectService from "./framework-services/connect";
import { IFrameworkService } from "./interfaces";

export default class ResponseAccessor {
    private static instance: ResponseAccessor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = this.assignFrameworkService();
    }

    public static getInstance(): ResponseAccessor {
        if (!ResponseAccessor.instance) {
            ResponseAccessor.instance = new ResponseAccessor();
        }
        return ResponseAccessor.instance;
    }

    public getHeaderField(res: any, fieldName: string): any {
        return this.frameworkService.getResHeaderField(res, fieldName);
    };

    public getField(res: any, fieldName: string): any {
        return this.frameworkService.getResField(res, fieldName);
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
