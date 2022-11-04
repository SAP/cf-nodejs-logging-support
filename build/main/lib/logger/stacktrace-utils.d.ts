export declare class StacktraceUtils {
    private static instance;
    private readonly MAX_STACKTRACE_SIZE;
    private constructor();
    static getInstance(): StacktraceUtils;
    isErrorWithStacktrace(obj: any): boolean;
    prepareStacktrace(stacktraceStr: any): any;
}
