import os from 'os';
import { Record } from "../logger/record.js";
import { OutputPlugin } from "./interfaces.js";
import { LevelUtils } from '../logger/level.js';

export class StdoutOutputPlugin implements OutputPlugin {

    private sinkFunction: ((level: string, payload: string) => any) | undefined;

    writeRecord(record: Record): void {
        const jsonStr: string = JSON.stringify(record.payload);
        if (this.sinkFunction) {
            const level: string = LevelUtils.getName(record.metadata.level);
            this.sinkFunction(level, jsonStr);
        } else {
            process.stdout.write(jsonStr + os.EOL);
        }
    }    

    setSinkFunction(callback: (level: string, payload: string) => any | undefined) {
        this.sinkFunction = callback;
    }
}
