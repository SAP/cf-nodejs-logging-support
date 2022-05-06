import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class RestifyService implements IFrameworkService {

    public getReqHeaderField(req: any, fieldName: string): string {
        return req.header(fieldName);
    }

    public getReqField(req: any, fieldName: string): string {
        return req[fieldName];
    }

    public getResHeaderField(res: any, fieldName: string): string {
        return res.get(fieldName);
    }

    public getResField(res: any, fieldName: string): string {
        return res[fieldName];
    }

    public finishLog(record: any) {
        RecordWriter.getInstance().writeLog(record);
    }
}
