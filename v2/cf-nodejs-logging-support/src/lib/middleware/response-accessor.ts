import { IFrameworkService } from "./interfaces";
import { assignFrameworkService } from "./utils";

export default class ResponseAccessor {
    private static instance: ResponseAccessor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = assignFrameworkService();
    }

    public static getInstance(): ResponseAccessor {
        if (!ResponseAccessor.instance) {
            ResponseAccessor.instance = new ResponseAccessor();
        }
        return ResponseAccessor.instance;
    }

    public getHeaderField(res: any, fieldName: string): string {
        return this.frameworkService.getResHeaderField(res, fieldName);
    };

    public getField(res: any, fieldName: string): any {
        return this.frameworkService.getResField(res, fieldName);
    };
}
