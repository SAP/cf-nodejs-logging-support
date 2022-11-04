"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpressService {
    getReqHeaderField(req, fieldName) {
        return req.get(fieldName);
    }
    getReqField(req, fieldName) {
        var _a, _b;
        if (fieldName == "protocol") {
            return "HTTP" + (req.httpVersion == null ? "" : "/" + req.httpVersion);
        }
        if (fieldName == "remote_host") {
            return (_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress;
        }
        if (fieldName == "remote_port") {
            return (_b = req.connection) === null || _b === void 0 ? void 0 : _b.remotePort.toString();
        }
        if (fieldName == "remote_user") {
            if (req.user && req.user.id) {
                return req.user.id;
            }
        }
        return req[fieldName];
    }
    getResHeaderField(res, fieldName) {
        return res.get(fieldName);
    }
    getResField(res, fieldName) {
        return res[fieldName];
    }
}
exports.default = ExpressService;
//# sourceMappingURL=express.js.map