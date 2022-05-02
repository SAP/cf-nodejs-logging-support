import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class ConnectService implements IFrameworkService {

    public getReqHeaderField(_req: any, fieldName: string): string {
        return _req.headers[fieldName];
    }

    public getReqField(_req: any, fieldName: string): string {
        return _req[fieldName];
    }

    public getResHeaderField(_res: any, fieldName: string): string {
        return _res.headers[fieldName];
    }

    public getResField(_res: any, fieldName: string): string {
        return _res[fieldName];
    }

    public finishLog(record: any) {
        RecordWriter.writeLog(record);
    }
}
