export enum Level {
    Inherit = -2,
    Off = -1,
    Error = 0,
    Warn = 1,
    Info = 2,
    Verbose = 3,
    Debug = 4,
    Silly = 5
}

export class LevelUtils {
    private static readonly defaultLevel: Level = Level.Info

    static getLevel(level: String | Level): Level {
        if (typeof level === 'string') {
            const key = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
            const lvl: Level = Level[key as keyof typeof Level]
            if (lvl !== undefined) {
                return lvl;
            }
        } else {
            return level as Level
        }
        return LevelUtils.defaultLevel;
    }

    static getName(level: Level): string {
        return Level[level].toLowerCase()
    }

    static isLevelEnabled(threshold: Level, level: Level) {
        if (level <= Level.Off) return false;
        return level <= threshold
    }
}
