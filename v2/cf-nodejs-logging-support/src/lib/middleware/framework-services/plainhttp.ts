import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class HttpService implements IFrameworkService {

    public getReqHeaderField(req: any, fieldName: string): string {
        return req.headers[fieldName];
    }

    public getReqField(req: any, fieldName: string): string {
        if (fieldName == "protocol") {
            return "HTTP" + (req.httpVersion == null ? "" : "/" + req.httpVersion);
        }
        if (fieldName == "remote_host") {
            return req.connection.remoteAddress;
        }
        if (fieldName == "remote_port") {
            return req.connection.remotePort.toString();
        }
        if (fieldName == "remote_user") {
            if (req.user && req.user.id) {
                return req.user.id;
            }
        }
        return req[fieldName];
    }

    public getResHeaderField(res: any, fieldName: string): string {
        return res.headers[fieldName];
    }

    public getResField(res: any, fieldName: string): string {
        return res[fieldName];
    }
}
