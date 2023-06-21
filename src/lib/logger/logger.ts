import LevelUtils from '../helper/levelUtils';
import { isValidObject } from '../middleware/utils';
import { Level } from './level';
import RecordFactory from './recordFactory';
import RecordWriter from './recordWriter';
import Context from './context';

export default class Logger {
    private parent?: Logger = undefined
    private context?: Context;
    private registeredCustomFields: Array<string> = [];
    private customFields: Map<string, any> = new Map<string, any>()
    private recordFactory: RecordFactory;
    private recordWriter: RecordWriter;
    protected loggingLevelThreshold: Level = Level.Inherit

    constructor(parent?: Logger, context?: Context) {
        if (parent) {
            this.parent = parent;
            this.registeredCustomFields = parent.registeredCustomFields;
        }
        if (context) {
            this.context = context;
        }
        this.recordFactory = RecordFactory.getInstance();
        this.recordWriter = RecordWriter.getInstance();
    }

    createLogger(customFields?: Map<string, any> | Object): Logger {
        let logger = new Logger(this, this.context);
        // assign custom fields, if provided
        if (customFields) {
            logger.setCustomFields(customFields);
        }
        return logger;
    }

    createContext() {
        this.context = new Context();
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
        const loggerCustomFields = this.getCustomFieldsFromLogger(this);

        let levelName: string;
        if (typeof level === 'string') {
            levelName = level;
        } else {
            levelName = LevelUtils.getName(level);
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

    setCustomFields(customFields: Map<string, any> | Object) {
        if (customFields instanceof Map) {
            this.customFields = customFields;
        } else if (isValidObject(customFields)) {
            this.customFields = new Map(Object.entries(customFields))
        }
    }

    getCustomFields(): Map<string, any> {
        return this.getCustomFieldsFromLogger(this)
    }

    getContextProperty(name: string): string | undefined {
        return this.context?.getProperty(name);
    }

    setContextProperty(name: string, value: string) {
        this.context?.setProperty(name, value);
    }

    getCorrelationId(): string | undefined {
        return this.getContextProperty("correlation_id");
    }

    setCorrelationId(value: string) {
        this.setContextProperty("correlation_id", value);
    }

    getTenantId(): string | undefined {
        return this.getContextProperty("tenant_id");
    }

    setTenantId(value: string) {
        this.setContextProperty("tenant_id", value);
    }

    getTenantSubdomain(): string | undefined {
        return this.getContextProperty("tenant_subdomain");
    }

    setTenantSubdomain(value: string) {
        this.setContextProperty("tenant_subdomain", value);
    }

    private getCustomFieldsFromLogger(logger: Logger): Map<string, any> {
        if (logger.parent && logger.parent !== this) {
            let parentFields = this.getCustomFieldsFromLogger(logger.parent);
            return new Map([...parentFields, ...logger.customFields]);
        }
        return logger.customFields;
    }
}
