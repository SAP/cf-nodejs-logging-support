"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class RequestAccessor {
    constructor() {
        this.frameworkService = (0, utils_1.assignFrameworkService)();
    }
    static getInstance() {
        if (!RequestAccessor.instance) {
            RequestAccessor.instance = new RequestAccessor();
        }
        return RequestAccessor.instance;
    }
    getHeaderField(req, fieldName) {
        return this.frameworkService.getReqHeaderField(req, fieldName);
    }
    getField(req, fieldName) {
        return this.frameworkService.getReqField(req, fieldName);
    }
    setFrameworkService() {
        this.frameworkService = (0, utils_1.assignFrameworkService)();
    }
}
exports.default = RequestAccessor;
//# sourceMappingURL=requestAccessor.js.map