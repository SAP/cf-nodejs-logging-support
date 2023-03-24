import os from 'os';

import Record from './record';


export default class RecordWriter {

    private static instance: RecordWriter;
    private customSinkFunction: ((level: string, payload: string) => any) | undefined;

    private constructor() {}

    static getInstance(): RecordWriter {
        if (!RecordWriter.instance) {
            RecordWriter.instance = new RecordWriter();
        }

        return RecordWriter.instance;
    }

    writeLog(record: Record): void {
        let level = record.metadata.level;
        if (this.customSinkFunction) {
            this.customSinkFunction(level, JSON.stringify(record.payload));
        } else {
            // default to stdout
            process.stdout.write(JSON.stringify(record.payload) + os.EOL);
        }
    }

    setSinkFunction(f: (level: string, payload: string) => any) {
        this.customSinkFunction = f;
    }
}
