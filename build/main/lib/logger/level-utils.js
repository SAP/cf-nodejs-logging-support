"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const level_1 = __importDefault(require("./level"));
class LevelUtils {
    static getLevel(name) {
        const level = level_1.default[name.toUpperCase()];
        if (level === undefined) {
            return LevelUtils.defaultLevel;
        }
        return level;
    }
    static getName(level) {
        return level_1.default[level].toLowerCase();
    }
    static isLevelEnabled(threshold, level) {
        if (level <= level_1.default.OFF)
            return false;
        return level <= threshold;
    }
}
exports.default = LevelUtils;
LevelUtils.defaultLevel = level_1.default.INFO;
//# sourceMappingURL=level-utils.js.map