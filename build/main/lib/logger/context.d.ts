export default class ReqContext {
    private properties;
    private config;
    private sourceUtils;
    constructor(req: any);
    getProp(key: string): any;
    getProps(): any;
    setProp(key: string, value: string): void;
    private setProperties;
}
