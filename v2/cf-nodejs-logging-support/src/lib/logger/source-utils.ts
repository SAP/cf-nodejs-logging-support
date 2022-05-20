import Config from "../config/config";
import { Source } from "../config/interfaces";

export class SourceUtils {
    // returns -1 when all sources were iterated
    static getNextValidSourceIndex(sources: Source[], startIndex: number): number {
        const framework = Config.getInstance().getFramework();
        var i: number = startIndex;

        for (i; i < sources.length; i++) {
            if (!sources[i].framework) {
                return i;
            }
            if (sources[i].framework == framework) {
                return i;
            }
        }
        return -1;
    }
}
