"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StacktraceUtils = void 0;
class StacktraceUtils {
    constructor() {
        this.MAX_STACKTRACE_SIZE = 55 * 1024;
    }
    static getInstance() {
        if (!StacktraceUtils.instance) {
            StacktraceUtils.instance = new StacktraceUtils();
        }
        return StacktraceUtils.instance;
    }
    // check if the given object is an Error with stacktrace using duck typing
    isErrorWithStacktrace(obj) {
        if (obj && obj.stack && obj.message && typeof obj.stack === "string" && typeof obj.message === "string") {
            return true;
        }
        return false;
    }
    // Split stacktrace into string array and truncate lines if required by size limitation
    // Truncation strategy: Take one line from the top and two lines from the bottom of the stacktrace until limit is reached.
    prepareStacktrace(stacktraceStr) {
        var fullStacktrace = stacktraceStr.split('\n');
        var totalLineLength = fullStacktrace.reduce((acc, line) => acc + line.length, 0);
        if (totalLineLength > this.MAX_STACKTRACE_SIZE) {
            var truncatedStacktrace = [];
            var stackA = [];
            var stackB = [];
            var indexA = 0;
            var indexB = fullStacktrace.length - 1;
            var currentLength = 73; // set to approx. character count for "truncated" and "omitted" labels
            for (let i = 0; i < fullStacktrace.length; i++) {
                if (i % 3 == 0) {
                    let line = fullStacktrace[indexA++];
                    if (currentLength + line.length > this.MAX_STACKTRACE_SIZE) {
                        break;
                    }
                    currentLength += line.length;
                    stackA.push(line);
                }
                else {
                    let line = fullStacktrace[indexB--];
                    if (currentLength + line.length > this.MAX_STACKTRACE_SIZE) {
                        break;
                    }
                    currentLength += line.length;
                    stackB.push(line);
                }
            }
            truncatedStacktrace.push("-------- STACK TRACE TRUNCATED --------");
            truncatedStacktrace = [...truncatedStacktrace, ...stackA];
            truncatedStacktrace.push(`-------- OMITTED ${fullStacktrace.length - (stackA.length + stackB.length)} LINES --------`);
            truncatedStacktrace = [...truncatedStacktrace, ...stackB.reverse()];
            return truncatedStacktrace;
        }
        return fullStacktrace;
    }
}
exports.StacktraceUtils = StacktraceUtils;
//# sourceMappingURL=stacktrace-utils.js.map