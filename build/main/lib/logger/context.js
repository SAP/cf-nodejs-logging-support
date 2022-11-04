"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const source_utils_1 = require("./source-utils");
class ReqContext {
    constructor(req) {
        this.properties = {};
        this.config = config_1.default.getInstance();
        this.sourceUtils = source_utils_1.SourceUtils.getInstance();
        this.setProperties(req);
    }
    getProp(key) {
        return this.properties[key];
    }
    getProps() {
        return this.properties;
    }
    setProp(key, value) {
        this.properties[key] = value;
    }
    setProperties(req) {
        const writtenAt = new Date();
        const contextFields = this.config.getContextFields();
        contextFields.forEach(field => {
            this.properties[field.name] = this.sourceUtils.getValue(field, this.properties, "context", writtenAt, req);
        });
    }
}
exports.default = ReqContext;
//# sourceMappingURL=context.js.map