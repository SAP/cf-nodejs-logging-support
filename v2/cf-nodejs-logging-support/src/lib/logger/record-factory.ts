import Config from '../config/config';
import util from "util";
import Level from './level';

export default class RecordFactory {

    private static reduceFields(_logObject: object): object {
        return _logObject;
    }

    // init a new log object and assign fields
    static buildMsgRecord(_args: Array<any>): any {
        const config = Config.getInstance().getConfig()!;
        // TO DO: check if Stacktrace
        let logObject = { "msg": "" }
        logObject.msg = util.format.apply(util, _args);
        // Alternative?: logObject.msg = _args.toString();

        let reducedLogObject = RecordFactory.reduceFields(logObject);

        return reducedLogObject;
    }

    // init a new req log object and assign fields
    static buildReqRecord(_req: object): any {
        const config = Config.getInstance().getConfig()!;;
        let logObject = { "level": "info" };
        let reducedLogObject = RecordFactory.reduceFields(logObject);

        return reducedLogObject;
    }

    // init a new res log object and assign fields
    static buildResRecord(_res: object): any {
        const config = Config.getInstance().getConfig()!;;
        let logObject = {};
        let reducedLogObject = RecordFactory.reduceFields(logObject);

        return reducedLogObject;
    }
}
