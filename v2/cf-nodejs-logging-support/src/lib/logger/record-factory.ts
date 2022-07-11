import util from "util";
import Config from "../config/config";
import { ConfigField } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";
import ReqContext from "./context";

export default class RecordFactory {
    private static REDACTED_PLACEHOLDER = "redacted";

    // init a new record and assign fields with output "msg-log"
    static buildMsgRecord(level: string, args: Array<any>, context?: ReqContext): any {

        const configInstance = Config.getInstance();
        const msgLogFields = configInstance.getMsgFields();
        let record: any = {
            "level": level,
        };

        msgLogFields.forEach(field => {
            if (field._meta!.isEnabled == false) {
                return;
            }

            record[field.name] = this.getFieldValue(field, record);

            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            if (field._meta!.isRedacted == true && record[field.name] != null) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
        });

        if (context) {
            const contextFields = context.getProps();
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

        const configInstance = Config.getInstance();
        const reqLogFields = configInstance.getReqFields();
        let record: any = { "level": "info" };

        reqLogFields.forEach(field => {
            if (field._meta!.isEnabled == false) {
                return;
            }

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

            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            // TO DO: sources as array case
            if (field._meta!.isRedacted == true && record[field.name] != null) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
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
        }

        return;
    }
}
