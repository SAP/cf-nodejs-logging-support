export interface IFrameworkService {
    getReqHeaderField(_req: any, _fieldName: string): any;
    getReqField(_req: any, _fieldName: string): any;
    getResHeaderField(_req: any, _fieldName: string): any;
    getResField(_req: any, _fieldName: string): any;
    finishLog(_record: any): any;
}
