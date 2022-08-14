import { IFrameworkService } from "./interfaces";
import { assignFrameworkService } from "./utils";

export default class RequestAccessor {
    private static instance: RequestAccessor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = assignFrameworkService();
    }

    public static getInstance(): RequestAccessor {
        if (!RequestAccessor.instance) {
            RequestAccessor.instance = new RequestAccessor();
        }

        return RequestAccessor.instance;
    }

    public getHeaderField(req: any, fieldName: string): string {
        return this.frameworkService.getReqHeaderField(req, fieldName);
    };

    public getField(req: any, fieldName: string): any {
        return this.frameworkService.getReqField(req, fieldName);
    };

    public setFrameworkService() {
        this.frameworkService = assignFrameworkService();
    }
}
