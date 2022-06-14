export interface IFrameworkService {
    getReqHeaderField(req: any, fieldName: string): string;
    getReqField(req: any, fieldName: string): any;
    getResHeaderField(req: any, fieldName: string): string;
    getResField(req: any, fieldName: string): any;
    finishLog(record: any): any;
}
