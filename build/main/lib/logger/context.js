"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const interfaces_1 = require("../config/interfaces");
const sourceUtils_1 = __importDefault(require("./sourceUtils"));
class Context {
    constructor(req) {
        this.properties = {};
        this.config = config_1.default.getInstance();
        this.sourceUtils = sourceUtils_1.default.getInstance();
        this.assignProperties(req);
    }
    getProperty(key) {
        return this.properties[key];
    }
    getProperties() {
        return this.properties;
    }
    setProperty(key, value) {
        this.properties[key] = value;
    }
    assignProperties(req) {
        const contextFields = this.config.getContextFields();
        contextFields.forEach(field => {
            this.properties[field.name] = this.sourceUtils.getValue(field, this.properties, interfaces_1.Output.ReqLog, req, null);
        });
    }
}
exports.default = Context;
//# sourceMappingURL=context.js.map