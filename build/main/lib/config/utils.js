"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvVarEnabled = void 0;
function isEnvVarEnabled(envVar) {
    const val = process.env[envVar];
    const isActivated = (val == "true" || val == "True" || val == "TRUE");
    if (isActivated) {
        return true;
    }
    return false;
}
exports.isEnvVarEnabled = isEnvVarEnabled;
//# sourceMappingURL=utils.js.map