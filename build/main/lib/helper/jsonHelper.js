"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JSONHelper {
    parseJSONSafe(value) {
        let tmp = {};
        if (value) {
            try {
                tmp = JSON.parse(value);
            }
            catch (e) {
                tmp = {};
            }
        }
        return tmp;
    }
}
exports.default = JSONHelper;
//# sourceMappingURL=jsonHelper.js.map