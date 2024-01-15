"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const config_schema_json_1 = __importDefault(require("./default/config-schema.json"));
class ConfigValidator {
    constructor() {
        const ajv = new ajv_1.default({ strict: false });
        this.validate = ajv.compile(config_schema_json_1.default);
    }
    isValid(config) {
        const valid = this.validate(config);
        if (!valid) {
            return [false, this.validate.errors];
        }
        return true;
    }
}
exports.default = ConfigValidator;
//# sourceMappingURL=configValidator.js.map