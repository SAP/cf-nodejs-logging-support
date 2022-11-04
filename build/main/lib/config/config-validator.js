"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_schema_json_1 = __importDefault(require("./config-schema.json"));
const ajv_1 = __importDefault(require("ajv"));
class ConfigValidator {
    static isValid(config) {
        const validate = ConfigValidator.ajv.compile(config_schema_json_1.default);
        const valid = validate(config);
        if (!valid) {
            return [false, validate.errors];
        }
        return true;
    }
}
exports.default = ConfigValidator;
ConfigValidator.ajv = new ajv_1.default();
//# sourceMappingURL=config-validator.js.map