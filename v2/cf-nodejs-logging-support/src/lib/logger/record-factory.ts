import util from "util";
import Config from "../config/config";
import { ConfigField } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";
import ReqContext from "./context";

export default class RecordFactory {

    // init a new record and assign fields with output "msg-log"
    static buildMsgRecord(args: Array<any>, context?: ReqContext): any {

        const msgLogFields = Config.getInstance().getMsgFields();
        let record: any = {
            "level": "info",
        };

        msgLogFields.forEach(field => {
            record[field.name] = this.getFieldValue(field, record);
        });

        if (context) {
            const contextFields = context.getFields();
            for (let key in contextFields) {
                record[key] = contextFields[key];
            }
        }

        record["msg"] = util.format.apply(util, args);
        // TO DO: check if Stacktrace
        return record;
    }

    // init a new record and assign fields with output "req-log"
    static buildReqRecord(req: any, res: any): any {

        const requestAccessor = RequestAccessor.getInstance();
        const responseAccessor = ResponseAccessor.getInstance();

        const reqLogFields = Config.getInstance().getReqFields();
        let record: any = { "level": "info" };
        reqLogFields.forEach(field => {
            if (!Array.isArray(field.source)) {
                switch (field.source.type) {
                    case "req-header":
                        record[field.name] = requestAccessor.getHeaderField(req, field.source.name!);
                        break;
                    case "req-object":
                        record[field.name] = requestAccessor.getField(req, field.source.name!);
                        break;
                    case "res-header":
                        record[field.name] = responseAccessor.getHeaderField(res, field.source.name!);
                        break;
                    case "res-object":
                        record[field.name] = responseAccessor.getField(res, field.source.name!);
                        break;
                    default:
                        record[field.name] = this.getFieldValue(field, record);
                }
            }

            // TO DO: sources as array case

        });
        return record;
    }

    private static getFieldValue(field: ConfigField, record: any): string | undefined {
        if (!Array.isArray(field.source)) {
            switch (field.source.type) {
                case "static":
                    return field.source.value;
                case "env":
                    if (field.source.path) {
                        return NestedVarResolver.resolveNestedVariable(process.env, field.source.path);
                    }
                    return process.env[field.source.name!];
                case "config-field":
                    return record[field.source.name!];
                default:
                    return undefined;
            }
        } else {

            // TO DO: handle sources as array case

            return undefined;
        }
    }
}
