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

    // Binds the Loglevel extracted from JWT token to the given request logger
    public bindDynLogLevel() {

    };

    public getHeaderField(req: any, fieldName: string): any {
        let result = this.frameworkService.getReqHeaderField(req, fieldName);
        return result;
    };

    public getField(req: any, fieldName: string): any {
        return this.frameworkService.getReqField(req, fieldName);
    };
}
