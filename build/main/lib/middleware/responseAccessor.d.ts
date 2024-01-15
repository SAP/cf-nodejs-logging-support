export default class ResponseAccessor {
    private static instance;
    private frameworkService;
    private constructor();
    static getInstance(): ResponseAccessor;
    getHeaderField(res: any, fieldName: string): string;
    getField(res: any, fieldName: string): any;
    setFrameworkService(): void;
}
