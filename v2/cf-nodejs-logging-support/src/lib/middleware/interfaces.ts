export interface IFrameworkService {
    getReqHeaderField(req: any, fieldName: string): any;
    getReqField(req: any, fieldName: string): any;
    getResHeaderField(req: any, fieldName: string): any;
    getResField(req: any, fieldName: string): any;
    finishLog(record: any): any;
}
