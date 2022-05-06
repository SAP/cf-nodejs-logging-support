import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class HttpService implements IFrameworkService {

    public getReqHeaderField(req: any, fieldName: string): string {
        return req.headers[fieldName];
    }

    public getReqField(req: any, fieldName: string): string {
        return req[fieldName];
    }

    public getResHeaderField(res: any, fieldName: string): string {
        return res.headers[fieldName];
    }

    public getResField(res: any, fieldName: string): string {
        return res[fieldName];
    }

    public finishLog(record: any) {
        RecordWriter.getInstance().writeLog(record);
    }
}
