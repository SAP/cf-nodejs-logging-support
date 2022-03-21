import Level from "./level"
import Logger from "./logger"

class RootLogger extends Logger {

    constructor() {
        super()
        this.loggingLevelThreshold = Level.INFO
    }

    addConfig(_object: Object) {
        // todo: add to config
    }

    setSinkFunction(_f: Function) { }

    enableTracing() { }

    logNetwork(_req: any, _res: any, _next: any) { }

    registerCustomFields(_object: Object) { }

    getBoundServices() { }

    // legacy methods
    overrideNetworkField(_field: string, _value: string) { }
    overrideCustomFieldFormat(_value: string) { }
    setLogPattern() { }
    createWinstonTransport() { }
    forceLogger(_logger: string) { }
}

export default RootLogger