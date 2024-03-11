import os from 'os';
import { Record } from "../logger/record";
import { OutputPlugin } from "./interfaces";
import { LevelUtils } from '../logger/level';

export class DefaultOutput implements OutputPlugin {

    private sinkFunction: ((level: string, payload: string) => any) | undefined;

    writeRecord(record: Record): void {
        let jsonStr: string = JSON.stringify(record.payload);
        if (this.sinkFunction) {
            let level: string = LevelUtils.getName(record.metadata.level);
            this.sinkFunction(level, jsonStr);
        } else {
            process.stdout.write(jsonStr + os.EOL);
        }
    }    

    setSinkFunction(callback: (level: string, payload: string) => any | undefined) {
        this.sinkFunction = callback;
    }
}
