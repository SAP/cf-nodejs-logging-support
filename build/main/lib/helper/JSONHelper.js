"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JSONHelper {
    static parseJSONSafe(value) {
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
//# sourceMappingURL=JSONHelper.js.map