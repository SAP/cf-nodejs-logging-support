export default class Context {
    private properties;
    private config;
    private sourceUtils;
    constructor(req?: any);
    getProperty(key: string): string | undefined;
    getProperties(): any;
    setProperty(key: string, value: string): void;
    private assignProperties;
}
