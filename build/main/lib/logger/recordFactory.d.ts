import { Record } from './record';
import Context from './context';
import { Level } from './level';
export default class RecordFactory {
    private static instance;
    private config;
    private stacktraceUtils;
    private sourceUtils;
    private cache;
    private constructor();
    static getInstance(): RecordFactory;
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: Level, args: Array<any>, context?: Context): Record;
    buildReqRecord(level: Level, req: any, res: any, context: Context): Record;
    private addCustomFields;
    private addContext;
    private addDynamicFields;
}
