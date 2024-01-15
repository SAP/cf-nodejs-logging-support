export default class StacktraceUtils {
    private static instance;
    private readonly MAX_STACKTRACE_SIZE;
    static getInstance(): StacktraceUtils;
    isErrorWithStacktrace(obj: any): boolean;
    prepareStacktrace(stacktraceStr: string): string[];
}
