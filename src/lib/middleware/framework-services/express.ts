import { IFrameworkService } from "../interfaces";

export default class ExpressService implements IFrameworkService {

    getReqHeaderField(req: any, fieldName: string): string {
        return req.header(fieldName);
    }

    getReqField(req: any, fieldName: string): any {
        let value: string | number | boolean | undefined = undefined;
        switch (fieldName) {
            case "protocol":
                value = "HTTP" + (req.httpVersion == null ? "" : "/" + req.httpVersion);
                break;
            case "remote_host":
                value = req.connection?.remoteAddress;
                break;
            case "remote_port":
                value = req.connection?.remotePort?.toString();
                break;
            case "remote_user":
                if (req.user && req.user.id) {
                    value = req.user.id;
                }
                break;
            default:
                value = req[fieldName]
                break;
        }
        return value
    }

    getResHeaderField(res: any, fieldName: string): string {
        return res.get(fieldName);
    }

    getResField(res: any, fieldName: string): any {
        return res[fieldName];
    }
}
