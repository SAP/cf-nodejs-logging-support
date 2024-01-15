"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpressService {
    getReqHeaderField(req, fieldName) {
        return req.header(fieldName);
    }
    getReqField(req, fieldName) {
        var _a, _b, _c;
        let value = undefined;
        switch (fieldName) {
            case "protocol":
                value = "HTTP" + (req.httpVersion == null ? "" : "/" + req.httpVersion);
                break;
            case "remote_host":
                value = (_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress;
                break;
            case "remote_port":
                value = (_c = (_b = req.connection) === null || _b === void 0 ? void 0 : _b.remotePort) === null || _c === void 0 ? void 0 : _c.toString();
                break;
            case "remote_user":
                if (req.user && req.user.id) {
                    value = req.user.id;
                }
                break;
            default:
                value = req[fieldName];
                break;
        }
        return value;
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