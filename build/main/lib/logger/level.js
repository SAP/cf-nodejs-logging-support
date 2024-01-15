"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelUtils = exports.Level = void 0;
var Level;
(function (Level) {
    Level[Level["Inherit"] = -2] = "Inherit";
    Level[Level["Off"] = -1] = "Off";
    Level[Level["Error"] = 0] = "Error";
    Level[Level["Warn"] = 1] = "Warn";
    Level[Level["Info"] = 2] = "Info";
    Level[Level["Verbose"] = 3] = "Verbose";
    Level[Level["Debug"] = 4] = "Debug";
    Level[Level["Silly"] = 5] = "Silly";
})(Level || (exports.Level = Level = {}));
class LevelUtils {
    static getLevel(level) {
        if (typeof level === 'string') {
            const key = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
            const lvl = Level[key];
            if (lvl !== undefined) {
                return lvl;
            }
        }
        else {
            return level;
        }
        return LevelUtils.defaultLevel;
    }
    static getName(level) {
        return Level[level].toLowerCase();
    }
    static isLevelEnabled(threshold, level) {
        if (level <= Level.Off)
            return false;
        return level <= threshold;
    }
}
exports.LevelUtils = LevelUtils;
LevelUtils.defaultLevel = Level.Info;
//# sourceMappingURL=level.js.map