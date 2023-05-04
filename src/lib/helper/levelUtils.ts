import { Level } from '../logger/level';

export default class LevelUtils {

    private static readonly defaultLevel: Level = Level.Info

    static getLevel(name: string): Level {
        const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        const level: Level = Level[key as keyof typeof Level]
        if (level === undefined) {
            return LevelUtils.defaultLevel;
        }
        return level
    }

    static getName(level: Level): string {
        return Level[level].toLowerCase()
    }

    static isLevelEnabled(threshold: Level, level: Level) {
        if (level <= Level.Off) return false;
        return level <= threshold
    }
}
