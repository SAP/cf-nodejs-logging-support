"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rootLogger_1 = __importDefault(require("./lib/logger/rootLogger"));
const rootLogger = rootLogger_1.default.getInstance();
module.exports = rootLogger; // assign default export
exports = module.exports; // re-assign exports
exports.default = rootLogger;
__exportStar(require("./lib/config/interfaces"), exports);
__exportStar(require("./lib/logger/record"), exports);
__exportStar(require("./lib/logger/level"), exports);
__exportStar(require("./lib/logger/logger"), exports);
__exportStar(require("./lib/plugins/interfaces"), exports);
__exportStar(require("./lib/plugins/defaultOutput"), exports);
__exportStar(require("./lib/plugins/otelOutput"), exports);
//# sourceMappingURL=index.js.map