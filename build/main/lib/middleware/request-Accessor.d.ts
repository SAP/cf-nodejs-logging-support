export default class RequestAccessor {
    private static instance;
    private frameworkService;
    private constructor();
    static getInstance(): RequestAccessor;
    getHeaderField(req: any, fieldName: string): string;
    getField(req: any, fieldName: string): any;
    setFrameworkService(): void;
}
