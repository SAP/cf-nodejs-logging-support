import Logger from "./logger"
import util from "util";
import Config from "../config/config";
import { ConfigField } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";
import ReqContext from "./context";

export default class RecordFactory {
    private static REDUCED_PLACEHOLDER = "redacted";

    // init a new record and assign fields with output "msg-log"
    static buildMsgRecord(levelName: string, args: Array<any>, context?: ReqContext): any {

        const configInstance = Config.getInstance();
        const msgLogFields = configInstance.getMsgFields();
        let record: any = {
            "level": levelName,
        };

        msgLogFields.forEach(field => {
            if (field.disable) {
                return;
            }

            if (!field._meta?.isEnabled == false) {
                // if enVarRedacted and the value of the field is present set to "redacted", if not ommit
                if (field._meta?.isRedacted == true) {
                    let fieldValue = this.getFieldValue(field, record);
                    if (fieldValue) {
                        record[field.name] = this.REDUCED_PLACEHOLDER;
                    }
                }
                return;
            }
            record[field.name] = this.getFieldValue(field, record);
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
        const level = (req.logger as Logger).getLoggingLevel();
        const requestAccessor = RequestAccessor.getInstance();
        const responseAccessor = ResponseAccessor.getInstance();

        const configInstance = Config.getInstance();
        const reqLogFields = configInstance.getReqFields();
        let record: any = { "level": level };

        reqLogFields.forEach(field => {
            if (field.disable) {
                return;
            }

            // if envVarSwitch and not enabled, ommit field
            if (field._meta?.isEnabled == false && field._meta?.isRedacted == false) {
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

            // if envVarRedacted and not enabled
            if (field._meta?.isRedacted == true && field._meta?.isEnabled == false) {
                // if field value is present set to "redacted", if not ommit
                if (record[field.name]) {
                    record[field.name] = this.REDUCED_PLACEHOLDER;
                } else {
                    record[field.name] = undefined;
                }
                return;
            }

            // TO DO: sources as array case
            if (!record[field.name]) {
                record[field.name] = this.handleConfigDefault(field);
            }
        });
        return record;
    }

    private static handleConfigDefault(field: ConfigField) {
        if (field.mandatory) {
            return field.default;
        }
        return undefined;
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

        if (record[field.name] == undefined) {
            record[field.name] = this.handleConfigDefault(field);
        }

        return;
    }
}
