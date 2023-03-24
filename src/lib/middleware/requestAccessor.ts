import { IFrameworkService } from './interfaces';
import { assignFrameworkService } from './utils';

export default class RequestAccessor {
    private static instance: RequestAccessor;
    private frameworkService: IFrameworkService;

    private constructor() {
        this.frameworkService = assignFrameworkService();
    }

    static getInstance(): RequestAccessor {
        if (!RequestAccessor.instance) {
            RequestAccessor.instance = new RequestAccessor();
        }
        return RequestAccessor.instance;
    }

    getHeaderField(req: any, fieldName: string): string {
        return this.frameworkService.getReqHeaderField(req, fieldName);
    }

    getField(req: any, fieldName: string): any {
        return this.frameworkService.getReqField(req, fieldName);
    }

    setFrameworkService() {
        this.frameworkService = assignFrameworkService();
    }
}
