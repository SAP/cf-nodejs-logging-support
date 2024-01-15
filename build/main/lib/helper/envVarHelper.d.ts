export default class EnvVarHelper {
    private static instance;
    static getInstance(): EnvVarHelper;
    isVarEnabled(name: string): boolean;
    resolveNestedVar(path: string[]): string | undefined;
    private resolve;
}
