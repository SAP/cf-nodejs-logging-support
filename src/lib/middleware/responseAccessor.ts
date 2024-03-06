import { FrameworkService } from './interfaces';
import { assignFrameworkService } from './utils';

export default class ResponseAccessor {
    private static instance: ResponseAccessor;
    private frameworkService: FrameworkService;

    private constructor() {
        this.frameworkService = assignFrameworkService();
    }

    static getInstance(): ResponseAccessor {
        if (!ResponseAccessor.instance) {
            ResponseAccessor.instance = new ResponseAccessor();
        }
        return ResponseAccessor.instance;
    }

    getHeaderField(res: any, fieldName: string): string | undefined {
        return this.frameworkService.getResHeaderField(res, fieldName);
    }

    getField(res: any, fieldName: string): any {
        return this.frameworkService.getResField(res, fieldName);
    }

    onFinish(res: any, handler: () => void): void {
        this.frameworkService.onResFinish(res, handler);
    }

    setFrameworkService(): void {
        this.frameworkService = assignFrameworkService();
    }
}
