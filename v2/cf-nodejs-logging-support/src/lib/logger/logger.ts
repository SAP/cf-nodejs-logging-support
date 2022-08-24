import Level from "./level";
import LevelUtils from "./level-utils";
import RecordWriter from "./record-writer";
import RecordFactory from "./record-factory";
import ReqContext from "./context";
import { isValidObject } from "../middleware/utils";

export default class Logger {
    private parent?: Logger = undefined
    private context?: ReqContext;
    private registeredCustomFields: Array<string> = [];
    private customFields: Map<string, any> = new Map<string, any>()
    private recordFactory: RecordFactory;
    private recordWriter: RecordWriter;
    protected loggingLevelThreshold: Level = Level.INHERIT

    constructor(parent?: Logger) {
        this.parent = parent;
        this.recordFactory = RecordFactory.getInstance();
        this.recordWriter = RecordWriter.getInstance();
    }

    createLogger(customFields?: any): Logger {

        let logger = new Logger(this);
        // assign custom fields, if provided
        if (customFields) {
            logger.setCustomFields(customFields);
        }
        return logger;
    }

    setLoggingLevel(name: string) {
        this.loggingLevelThreshold = LevelUtils.getLevel(name)
    }

    getLoggingLevel(): string {
        if (this.loggingLevelThreshold == Level.INHERIT) {
            return this.parent!.getLoggingLevel()
        }
        return LevelUtils.getName(this.loggingLevelThreshold)
    }

    isLoggingLevel(name: string): boolean {
        if (this.loggingLevelThreshold == Level.INHERIT) {
            return this.parent!.isLoggingLevel(name)
        }
        const level = LevelUtils.getLevel(name)
        return LevelUtils.isLevelEnabled(this.loggingLevelThreshold, level)
    }

    logMessage(levelName: string, ..._args: any) {
        if (!this.isLoggingLevel(levelName) || this.loggingLevelThreshold == Level.OFF) return;
        const loggerCustomFields = Object.assign({}, this.extractCustomFieldsFromLogger(this));

        const record = this.recordFactory.buildMsgRecord(this.registeredCustomFields, loggerCustomFields, levelName, _args, this.context);

        this.recordWriter.writeLog(record);
    }

    error() {
        this.logMessage("error", ...arguments);
    }

    warn() {
        this.logMessage("warn", ...arguments);
    }

    info() {
        this.logMessage("info", ...arguments);
    }

    verbose() {
        this.logMessage("verbose", ...arguments);
    }

    debug() {
        this.logMessage("debug", ...arguments);
    }

    silly() {
        this.logMessage("silly", ...arguments);
    }

    isError() {
        return this.isLoggingLevel("error");
    }

    isWarn() {
        return this.isLoggingLevel("warn");
    }

    isInfo() {
        return this.isLoggingLevel("info");
    }

    isVerbose() {
        return this.isLoggingLevel("verbose");
    }

    isDebug() {
        return this.isLoggingLevel("debug");
    }

    isSilly() {
        return this.isLoggingLevel("silly");
    }

    registerCustomFields(fieldNames: Array<string>) {
        this.registeredCustomFields = fieldNames;
    }

    setCustomFields(customFields: Map<string, any>) {
        this.customFields = customFields;
    }

    getCustomFields(): Map<string, any> {
        if (this.parent) {
            return new Map([...this.parent.getCustomFields(), ...this.customFields.entries()])
        } else {
            return new Map(...this.customFields.entries())
        }
    }

    getCorrelationId(): string | undefined {
        return this.context?.getProp("correlation_id");
    }

    setCorrelationId(value: string) {
        this.context?.setProp("correlation_id", value);
    }

    getTenantId(): string | undefined {
        return this.context?.getProp("tenant_id");
    }

    setTenantId(value: string) {
        this.context?.setProp("tenant_id", value);

    }

    getTenantSubdomain(): string | undefined {
        return this.context?.getProp("tenant_subdomain");
    }

    setTenantSubdomain(value: string) {
        this.context?.setProp("tenant_subdomain", value);
    }

    initContext(_req: any) {
        this.context = new ReqContext(_req);
        return this.context;
    }

    private extractCustomFieldsFromLogger(logger: Logger): any {
        let fields = {};
        if (logger.parent && logger.parent !== this) {
            fields = this.extractCustomFieldsFromLogger(logger.parent);
        }

        if (isValidObject(logger.customFields)) {
            fields = Object.assign(fields, logger.customFields);
        }

        return fields;
    }
}
