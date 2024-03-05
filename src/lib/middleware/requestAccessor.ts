import { FrameworkService } from './interfaces';
import { assignFrameworkService } from './utils';

export default class RequestAccessor {
    private static instance: RequestAccessor;
    private frameworkService: FrameworkService;

    private constructor() {
        this.frameworkService = assignFrameworkService();
    }

    static getInstance(): RequestAccessor {
        if (!RequestAccessor.instance) {
            RequestAccessor.instance = new RequestAccessor();
        }
        return RequestAccessor.instance;
    }

    getHeaderField(req: any, fieldName: string): string | undefined {
        return this.frameworkService.getReqHeaderField(req, fieldName);
    }

    getField(req: any, fieldName: string): any {
        return this.frameworkService.getReqField(req, fieldName);
    }

    setFrameworkService(): void {
        this.frameworkService = assignFrameworkService();
    }
}
