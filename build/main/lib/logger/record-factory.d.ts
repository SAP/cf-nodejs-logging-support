import ReqContext from "./context";
export default class RecordFactory {
    private static instance;
    private config;
    private stacktraceUtils;
    private sourceUtils;
    private LOG_TYPE;
    private cache;
    private constructor();
    static getInstance(): RecordFactory;
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any;
    buildReqRecord(req: any, res: any, context: ReqContext): any;
    private addCustomFields;
    private addContext;
    private addDynamicFields;
}
