import util from "util";

export default class RecordFactory {

    private static reduceFields(_record: object): object {
        return _record;
    }

    // init a new log object and assign fields
    static buildMsgRecord(_args: Array<any>): any {
        // TO DO: check if Stacktrace
        let record = { "msg": "" }
        record.msg = util.format.apply(util, _args);
        // Alternative?: record.msg = _args.toString();

        let reducedRecord = RecordFactory.reduceFields(record);

        return reducedRecord;
    }

    // init a new req log object and assign fields
    static buildReqRecord(_req: object): any {
        let record = { "level": "info" };
        let reducedRecord = RecordFactory.reduceFields(record);

        return reducedRecord;
    }

    // init a new res log object and assign fields
    static buildResRecord(_res: object): any {
        let record = {};
        let reducedRecord = RecordFactory.reduceFields(record);

        return reducedRecord;
    }
}
