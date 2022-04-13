import Config from './../config/config';

export default class LogFactory {

    private static reduceFields(_logObject: object): object {
        return {};
    }

    // init a new log object and assign fields
    static build(_req: object): object {
        const framework = Config.getInstance().getConfig().framework!;
        const config;
        let logObject = {};
        let reducedLogObject = LogFactory.reduceFields(logObject);

        return reducedLogObject;
    }

    // init a new log object and assign fields
    static buildMsgLog(): object {
        const framework = Config.getInstance().getConfig().framework!;
        const config;
        let logObject = {};
        let reducedLogObject = LogFactory.reduceFields(logObject);

        return reducedLogObject;
    }


}
