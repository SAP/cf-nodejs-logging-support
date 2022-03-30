import Level from "./level"
import Logger from "./logger"
import Middleware from "../middleware/middleware"

export default class RootLogger extends Logger {
    private middleware: Middleware = new Middleware();

    constructor() {
        super()
        this.loggingLevelThreshold = Level.INFO
    }

    addConfig(_object: Object) {
        // todo: add to config
    }

    setSinkFunction(_f: Function) { }

    enableTracing() { }

    logNetwork(_req: any, _res: any, _next: any) {
        this.middleware.logNetwork(_req, _res, _next);
    }

    registerCustomFields(_object: Object) { }

    getBoundServices() { }

    // legacy methods
    overrideNetworkField(_field: string, _value: string) { }
    overrideCustomFieldFormat(_value: string) { }
    setLogPattern() { }
    createWinstonTransport() { }
    forceLogger(_logger: string) {
        this.middleware.forceLogger(_logger);
    }
}
