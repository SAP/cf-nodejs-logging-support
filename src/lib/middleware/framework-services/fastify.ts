import { FrameworkService } from "../interfaces";

export default class FastifyService implements FrameworkService {

    getReqHeaderField(req: any, fieldName: string): string {
        return req.headers[fieldName] ? req.headers[fieldName] : ""
    }

    getReqField(req: any, fieldName: string): any {
        let value: string | number | boolean | undefined = undefined;
        switch (fieldName) {
            case "protocol":
                value = "HTTP" + (req.raw.httpVersion == null ? "" : "/" + req.raw.httpVersion);
                break;
            case "remote_host":
                value = req.raw.connection?.remoteAddress;
                break;
            case "remote_port":
                value = req.raw.connection?.remotePort?.toString();
                break;
            case "remote_user":
                if (req.raw.user && req.raw.user.id) {
                    value = req.raw.user.id;
                }
                break;
            default:
                value = req.raw[fieldName]
                break;
        }
        return value
    }

    getResHeaderField(res: any, fieldName: string): string {
        let value = res.getHeader(fieldName)
        return value ? value : "";
    }

    getResField(res: any, fieldName: string): any {
        return res.raw[fieldName];
    }

    onResFinish(res: any, handler: () => void): undefined {
        res.raw.on("header", handler);
        res.raw.on("finish", handler);
    }
}
