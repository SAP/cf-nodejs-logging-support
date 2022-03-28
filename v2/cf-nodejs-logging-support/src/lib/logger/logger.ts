import LevelUtils from "./level-utils";
import Level from "./level";

export default class Logger {
    private parent? : Logger = undefined
    private customFields : Map<string, any> = new Map<string, any>()
    protected loggingLevelThreshold : Level = Level.INHERIT

    constructor(parent? : Logger) {
        this.parent = parent;
    }

    createLogger(_object?: Object): Logger {
        return new Logger(this)
    }
    
    setLoggingLevel(name: string) {
        this.loggingLevelThreshold = LevelUtils.getLevel(name)
    }
    
    getLoggingLevel() : string { 
        if (this.loggingLevelThreshold == Level.INHERIT) {
            return this.parent!.getLoggingLevel()
        }
        return LevelUtils.getName(this.loggingLevelThreshold)
    }

    isLoggingLevel(name: string) : boolean { 
        if (this.loggingLevelThreshold == Level.INHERIT) {
            return this.parent!.isLoggingLevel(name)
        }
        let level = LevelUtils.getLevel(name) 
        return LevelUtils.isLevelEnabled(this.loggingLevelThreshold, level)
    }

    logMessage(levelName: string, ..._args: any) {
        if (!this.isLoggingLevel(levelName)) return;

        console.log(levelName + " " + _args)

        // todo: process log message
    }

    setCustomFields(customFields: Map<string, any>) {
        this.customFields = customFields
    }

    getCustomFields() : Map<string, any> {
        if (this.parent) {
            return new Map([...this.parent.getCustomFields(), ...this.customFields.entries()])
        } else {
            return new Map(...this.customFields.entries())
        }
    }
}
