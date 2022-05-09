import util from "util";
import Config from "../config/config";
import { ConfigField } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccesor from "../middleware/request-accesor";
import ResponseAccesor from "../middleware/response-accessor";
import ReqContext from "./context";

export default class RecordFactory {
    private static REDUCED_PLACEHOLDER = "redacted";

    // init a new record and assign fields with output "msg-log"
    static buildMsgRecord(_args: Array<any>, _context?: ReqContext): any {

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
            if (!Array.isArray(field.source)) {
                switch (field.source.type) {
                    case "req-header":
                        record[field.name] = _context?.getProp(field.name as string);
                        break;
                    case "req-object":
                        record[field.name] = _context?.getProp(field.name as string);
                        break;
                    case "static":
                        record[field.name] = field.source.value;
                        break;
                    case "env":
                        if (field.source.path) {
                            record[field.name] = NestedVarResolver.resolveNestedVariable(process.env, field.source.path);
                            break;
                        }
                        record[field.name] = process.env[field.source.name!];
                        break;
                    case "config-field":
                        record[field.name] = record[field.source.name!];
                        break;
                }
            } else {

                // TO DO: handle sources as array case
            }

            // TO DO: handle defaults
            if (record[field.name] == undefined) {
                record[field.name] = this.handleConfigDefault(record, field);
            }


        });
        record["msg"] = util.format.apply(util, _args);
        // TO DO: check if Stacktrace
        return record;
    }

    // init a new record and assign fields with output "req-log"
    static buildReqRecord(_req: any, _res: any): any {

        const requestAccesor = RequestAccesor.getInstance();
        const responseAccesor = ResponseAccesor.getInstance();

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
                        record[field.name] = requestAccesor.getHeaderField(_req, field.source.name as string);
                        break;
                    case "req-object":
                        record[field.name] = requestAccesor.getField(_req, field.source.name as string);
                        break;
                    case "res-header":
                        record[field.name] = responseAccesor.getHeaderField(_res, field.source.name as string);
                        break;
                    case "res-object":
                        record[field.name] = responseAccesor.getField(_res, field.source.name as string);
                        break;
                    case "static":
                        record[field.name] = field.source.value;
                        break;
                    case "env":
                        if (field.source.path) {
                            record[field.name] = NestedVarResolver.resolveNestedVariable(process.env, field.source.path);
                            break;
                        }
                        record[field.name] = process.env[field.source.name!];
                        break;
                    case "config-field":
                        record[field.name] = record[field.source.name!];
                        break;
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
}
