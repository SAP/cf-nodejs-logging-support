import Level from "./level";
export default class LevelUtils {
    private static readonly defaultLevel;
    static getLevel(name: string): Level;
    static getName(level: Level): string;
    static isLevelEnabled(threshold: Level, level: Level): boolean;
}
