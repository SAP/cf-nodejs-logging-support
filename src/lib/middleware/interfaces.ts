export interface FrameworkService {
    getReqHeaderField(req: any, fieldName: string): string | undefined;
    getReqField(req: any, fieldName: string): string | number | boolean | undefined;
    getResHeaderField(req: any, fieldName: string): string | undefined;
    getResField(req: any, fieldName: string): string | number | boolean | undefined;
    onResFinish(res: any, handler: () => void): void;
}
