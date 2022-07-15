import Config from "../config/config";
import ConnectService from "./framework-services/connect";
import ExpressService from "./framework-services/express";
import HttpService from "./framework-services/plainhttp";
import RestifyService from "./framework-services/restify";
import { IFrameworkService } from "./interfaces";

export function assignFrameworkService(): IFrameworkService {
    const framework = Config.getInstance().getFramework();
    switch (framework) {
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

export function isValidObject(obj: any, canBeEmpty?: any): boolean {
    if (!obj) {
        return false;
    } else if (typeof obj !== "object") {
        return false;
    } else if (!canBeEmpty && Object.keys(obj).length === 0) {
        return false;
    }
    return true;
}
