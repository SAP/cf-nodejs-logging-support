export interface IFrameworkService {
    getReqHeaderField(req: any, fieldName: string): string;
    getReqField(req: any, fieldName: string): string | number | boolean | undefined;
    getResHeaderField(req: any, fieldName: string): string;
    getResField(req: any, fieldName: string): string | number | boolean | undefined;
}
