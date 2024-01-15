"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObject = exports.assignFrameworkService = void 0;
const config_1 = __importDefault(require("../config/config"));
const interfaces_1 = require("../config/interfaces");
const connect_1 = __importDefault(require("./framework-services/connect"));
const express_1 = __importDefault(require("./framework-services/express"));
const plainhttp_1 = __importDefault(require("./framework-services/plainhttp"));
const restify_1 = __importDefault(require("./framework-services/restify"));
function assignFrameworkService() {
    const framework = config_1.default.getInstance().getFramework();
    switch (framework) {
        case interfaces_1.Framework.Restify:
            return new restify_1.default();
        case interfaces_1.Framework.NodeJsHttp:
            return new plainhttp_1.default();
        case interfaces_1.Framework.Connect:
            return new connect_1.default();
        case interfaces_1.Framework.Express:
        default:
            return new express_1.default();
    }
}
exports.assignFrameworkService = assignFrameworkService;
function isValidObject(obj, canBeEmpty) {
    if (!obj) {
        return false;
    }
    else if (typeof obj !== "object") {
        return false;
    }
    else if (!canBeEmpty && Object.keys(obj).length === 0) {
        return false;
    }
    return true;
}
exports.isValidObject = isValidObject;
//# sourceMappingURL=utils.js.map