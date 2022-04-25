import util from "util";
import RequestAccesor from "../middleware/request-accesor";

export default class RecordFactory {

    // init a new log object and assign fields
    static buildMsgRecord(_args: Array<any>): any {
        // TO DO: check if Stacktrace
        let record = { "msg": "" }
        record.msg = util.format.apply(util, _args);
        // Alternative?: record.msg = _args.toString();

        return record;
    }

    // init a new req log object and assign fields
    static buildReqRecord(_req: object, _args?: Array<any>): any {
        let record = { "level": "info" };
        return record;
    }

    // init a new res log object and assign fields
    static buildResRecord(_res: object): any {
        let record = {};
        return record;
    }
}
