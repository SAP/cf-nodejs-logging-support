import Level from "./level";

export default class LevelUtils {

    private static defaultLevel: Level = Level.INFO

    static getLevel(name: string): Level {
        let level: Level = Level[name.toUpperCase() as keyof typeof Level]
        if (level === undefined) {
            return LevelUtils.defaultLevel;
        }
        return level
    }

    static getName(level: Level): string {
        return Level[level].toLowerCase()
    }

    static isLevelEnabled(threshold: Level, level: Level) {
        return level <= threshold
    }
}