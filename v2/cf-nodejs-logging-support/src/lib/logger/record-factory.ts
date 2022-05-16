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
    static buildMsgRecord(args: Array<any>, context?: ReqContext): any {

        const msgLogFields = Config.getInstance().getMsgFields();
        let record: any = {
            "level": "info",
        };

        msgLogFields.forEach(field => {
            if (field.envVarRedact || field.envVarSwitch) {
                const shouldBeReduced = this.isReducedField(field);
                if (shouldBeReduced) {
                    if (field.envVarRedact) {
                        record[field.name] = this.REDUCED_PLACEHOLDER;
                    }
                    return;
                }
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

        const requestAccessor = RequestAccessor.getInstance();
        const responseAccessor = ResponseAccessor.getInstance();

        const reqLogFields = Config.getInstance().getReqFields();
        let record: any = { "level": "info" };
        reqLogFields.forEach(field => {

            if (field.envVarRedact || field.envVarSwitch) {
                const shouldBeReduced = this.isReducedField(field);
                if (shouldBeReduced) {
                    if (field.envVarRedact) {
                        record[field.name] = this.REDUCED_PLACEHOLDER;
                    }
                    return;
                }
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

            // TO DO: sources as array case
            if (!record[field.name]) {
                record[field.name] = this.handleConfigDefault(record, field);
            }
        });
        return record;
    }

    private static isReducedField(field: ConfigField): boolean {
        const val = process.env[field.envVarRedact!];
        const isActivated = (val == "true" || val == "True" || val == "TRUE");
        if (!isActivated) {
            return true;
        }
        return false;
    }

    private static handleConfigDefault(record: any, field: ConfigField) {
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

        // TO DO: handle defaults
        if (record[field.name] == undefined) {
            record[field.name] = this.handleConfigDefault(record, field);
        }

        return;
    }
}
