import RecordWriter from "../../logger/record-writer";
import { IFrameworkService } from "../interfaces";

export default class ExpressService implements IFrameworkService {

    public getReqHeaderField(req: any, fieldName: string): string {
        return req.get(fieldName);
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
}
