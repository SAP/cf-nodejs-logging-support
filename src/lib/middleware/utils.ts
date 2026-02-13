import Config from '../config/config';
import { Framework } from '../config/interfaces';
import ConnectService from './framework-services/connect';
import ExpressService from './framework-services/express';
import FastifyService from './framework-services/fastify';
import HttpService from './framework-services/plainhttp';
import { FrameworkService } from './interfaces';

export function assignFrameworkService(): FrameworkService {
    const framework = Config.getInstance().getFramework();
    switch (framework) {
        case Framework.NodeJsHttp:
            return new HttpService();
        case Framework.Connect:
            return new ConnectService();
        case Framework.Fastify:
            return new FastifyService();
        case Framework.Express:
        default:
            return new ExpressService();
    }
}

export function isValidObject(obj: any, canBeEmpty?: boolean): boolean {
    if (!obj) {
        return false;
    } else if (typeof obj !== "object") {
        return false;
    } else if (!canBeEmpty && Object.keys(obj).length === 0) {
        return false;
    }
    return true;
}
