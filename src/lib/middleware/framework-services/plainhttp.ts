import { FrameworkService } from "../interfaces";

export default class HttpService implements FrameworkService {

    getReqHeaderField(req: any, fieldName: string): string | undefined {
        return req.headers[fieldName];
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

    getResHeaderField(res: any, fieldName: string): string | undefined {
        return res.getHeader ? res.getHeader(fieldName) : undefined;
    }

    getResField(res: any, fieldName: string): any {
        return res[fieldName];
    }

    onResFinish(res: any, handler: () => void): void {
        res.on("header", handler);
        res.on("finish", handler);
    }
}
