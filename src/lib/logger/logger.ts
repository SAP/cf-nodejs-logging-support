import LevelUtils from '../helper/levelUtils';
import { isValidObject } from '../middleware/utils';
import { Level } from './level';
import RecordFactory from './recordFactory';
import RecordWriter from './recordWriter';
import RequestContext from './requestContext';

export default class Logger {
    private parent?: Logger = undefined
    private context?: RequestContext;
    private registeredCustomFields: Array<string> = [];
    private customFields: Map<string, any> = new Map<string, any>()
    private recordFactory: RecordFactory;
    private recordWriter: RecordWriter;
    protected loggingLevelThreshold: Level = Level.Inherit

    constructor(parent?: Logger, reqContext?: RequestContext) {
        if (parent) {
            this.parent = parent;
            this.registeredCustomFields = parent.registeredCustomFields;
        }
        if (reqContext) {
            this.context = reqContext;
        }
        this.recordFactory = RecordFactory.getInstance();
        this.recordWriter = RecordWriter.getInstance();
    }

    createLogger(customFields?: Map<string, any>): Logger {

        let logger = new Logger(this);
        // assign custom fields, if provided
        if (customFields) {
            logger.setCustomFields(customFields);
        }
        return logger;
    }

    setLoggingLevel(level: string | Level) {
        if (typeof level === 'string') {
            this.loggingLevelThreshold = LevelUtils.getLevel(level)
        } else {
            this.loggingLevelThreshold = level
        }
    }

    getLoggingLevel(): string {
        if (this.loggingLevelThreshold == Level.Inherit) {
            return this.parent!.getLoggingLevel()
        }
        return LevelUtils.getName(this.loggingLevelThreshold)
    }

    isLoggingLevel(level: string | Level): boolean {
        if (this.loggingLevelThreshold == Level.Inherit) {
            return this.parent!.isLoggingLevel(level)
        }
        if (typeof level === 'string') {
            return LevelUtils.isLevelEnabled(this.loggingLevelThreshold, LevelUtils.getLevel(level))
        } else {
            return LevelUtils.isLevelEnabled(this.loggingLevelThreshold, level)
        }
    }

    logMessage(level: string | Level, ...args: any) {
        if (!this.isLoggingLevel(level)) return;
        const loggerCustomFields = Object.assign({}, this.getCustomFieldsFromLogger(this));

        let levelName : string
        if (typeof level === 'string') {
            levelName = level
        } else {
            levelName = LevelUtils.getName(level)
        }

        const record = this.recordFactory.buildMsgRecord(this.registeredCustomFields, loggerCustomFields, levelName, args, this.context);
        this.recordWriter.writeLog(record);
    }

    error(...args: any) {
        this.logMessage("error", ...args);
    }

    warn(...args: any) {
        this.logMessage("warn", ...args);
    }

    info(...args: any) {
        this.logMessage("info", ...args);
    }

    verbose(...args: any) {
        this.logMessage("verbose", ...args);
    }

    debug(...args: any) {
        this.logMessage("debug", ...args);
    }

    silly(...args: any) {
        this.logMessage("silly", ...args);
    }

    isError(): boolean {
        return this.isLoggingLevel("error");
    }

    isWarn(): boolean {
        return this.isLoggingLevel("warn");
    }

    isInfo(): boolean {
        return this.isLoggingLevel("info");
    }

    isVerbose(): boolean {
        return this.isLoggingLevel("verbose");
    }

    isDebug(): boolean {
        return this.isLoggingLevel("debug");
    }

    isSilly(): boolean {
        return this.isLoggingLevel("silly");
    }

    registerCustomFields(fieldNames: Array<string>) {
        this.registeredCustomFields.splice(0, this.registeredCustomFields.length);
        this.registeredCustomFields.push(...fieldNames);
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
        return this.context?.getProperty("correlation_id");
    }

    setCorrelationId(value: string) {
        this.context?.setProperty("correlation_id", value);
    }

    getTenantId(): string | undefined {
        return this.context?.getProperty("tenant_id");
    }

    setTenantId(value: string) {
        this.context?.setProperty("tenant_id", value);

    }

    getTenantSubdomain(): string | undefined {
        return this.context?.getProperty("tenant_subdomain");
    }

    setTenantSubdomain(value: string) {
        this.context?.setProperty("tenant_subdomain", value);
    }

    private getCustomFieldsFromLogger(logger: Logger): any {
        let fields = {};
        if (logger.parent && logger.parent !== this) {
            fields = this.getCustomFieldsFromLogger(logger.parent);
        }

        if (isValidObject(logger.customFields)) {
            fields = Object.assign(fields, logger.customFields);
        }

        return fields;
    }
}
