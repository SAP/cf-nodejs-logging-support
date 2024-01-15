export declare enum Level {
    Inherit = -2,
    Off = -1,
    Error = 0,
    Warn = 1,
    Info = 2,
    Verbose = 3,
    Debug = 4,
    Silly = 5
}
export declare class LevelUtils {
    private static readonly defaultLevel;
    static getLevel(level: String | Level): Level;
    static getName(level: Level): string;
    static isLevelEnabled(threshold: Level, level: Level): boolean;
}
