"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSONHelper_1 = __importDefault(require("../helper/JSONHelper"));
class EnvService {
    static getRuntimeName() {
        return process.env.VCAP_SERVICES ? "CF" : "Kyma";
    }
    static getBoundServices() {
        const boundServices = JSONHelper_1.default.parseJSONSafe(process.env.VCAP_SERVICES);
        return boundServices;
    }
}
exports.default = EnvService;
//# sourceMappingURL=env-service.js.map