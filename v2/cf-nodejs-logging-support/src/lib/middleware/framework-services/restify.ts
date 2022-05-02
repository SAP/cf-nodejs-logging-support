import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class RestifyService implements IFrameworkService {

    public getReqHeaderField(_req: any, fieldName: string): string {
        return _req.header(fieldName);
    }

    public getReqField(_req: any, fieldName: string): string {
        return _req[fieldName];
    }

    public getResHeaderField(_res: any, fieldName: string): string {
        return _res.get(fieldName);
    }

    public getResField(_res: any, fieldName: string): string {
        return _res[fieldName];
    }

    public finishLog(record: any) {
        RecordWriter.writeLog(record);
    }
}
