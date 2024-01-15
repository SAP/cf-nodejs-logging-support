"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class ResponseAccessor {
    constructor() {
        this.frameworkService = (0, utils_1.assignFrameworkService)();
    }
    static getInstance() {
        if (!ResponseAccessor.instance) {
            ResponseAccessor.instance = new ResponseAccessor();
        }
        return ResponseAccessor.instance;
    }
    getHeaderField(res, fieldName) {
        return this.frameworkService.getResHeaderField(res, fieldName);
    }
    getField(res, fieldName) {
        return this.frameworkService.getResField(res, fieldName);
    }
    setFrameworkService() {
        this.frameworkService = (0, utils_1.assignFrameworkService)();
    }
}
exports.default = ResponseAccessor;
//# sourceMappingURL=responseAccessor.js.map