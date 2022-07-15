import Level from "./level";
import LevelUtils from "./level-utils";
import RecordWriter from "./record-writer";
import RecordFactory from "./record-factory";
import ReqContext from "./context";

export default class Logger {
    private parent?: Logger = undefined
    private context?: ReqContext;
    private registeredCustomFields: Array<string> = [];
    private customFields: Map<string, any> = new Map<string, any>()
    protected loggingLevelThreshold: Level = Level.INHERIT

    constructor(parent?: Logger) {
        this.parent = parent;
    }

    createLogger(): Logger {
        return new Logger(this)
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
        if (!this.isLoggingLevel(levelName)) return;
        const record = RecordFactory.getInstance().buildMsgRecord(this.registeredCustomFields, this.customFields, levelName, _args, this.context);
        RecordWriter.getInstance().writeLog(record);
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
        this.customFields = customFields
    }

    getCustomFields(): Map<string, any> {
        if (this.parent) {
            return new Map([...this.parent.getCustomFields(), ...this.customFields.entries()])
        } else {
            return new Map(...this.customFields.entries())
        }
    }

    initContext(_req: any) {
        this.context = new ReqContext(_req);
        return this.context;
    }
}
