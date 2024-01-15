"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonHelper_1 = __importDefault(require("./jsonHelper"));
class EnvService {
    constructor() {
        this.jsonHelper = new jsonHelper_1.default();
    }
    static getInstance() {
        if (!EnvService.instance) {
            EnvService.instance = new EnvService();
        }
        return EnvService.instance;
    }
    getRuntimeName() {
        return process.env.VCAP_APPLICATION ? "CF" : "Kyma";
    }
    getBoundServices() {
        const boundServices = this.jsonHelper.parseJSONSafe(process.env.VCAP_SERVICES);
        return boundServices;
    }
}
exports.default = EnvService;
//# sourceMappingURL=envService.js.map