import RecordWriter from "../../logger/record-writer";

export default class ExpressService {

    public getReqHeaderField(_req: any, fieldName: string): string {
        return "";
    }

    public getReqField(_req: any, fieldName: string): string {
        return "";
    }

    public getResHeaderField(_res: any, fieldName: string): string {
        return "";
    }

    public getResField(_res: any, fieldName: string): string {
        return "";
    }

    public finishLog(record: any) {
        RecordWriter.writeLog(record);
    }
}
