import { ConfigObject, customFieldsFormat, framework } from "../config/interfaces";
import Logger from "./logger";
export default class RootLogger extends Logger {
    private static instance;
    private config;
    private constructor();
    static getInstance(): RootLogger;
    getConfig(): ConfigObject;
    getConfigFields(...fieldNames: string[]): import("../config/interfaces").ConfigField[];
    addConfig(...configObject: ConfigObject[]): void;
    clearFieldsConfig(): void;
    setCustomFieldsFormat(format: customFieldsFormat): void;
    setStartupMessageEnabled(enabled: boolean): void;
    setSinkFunction(f: Function): void;
    enableTracing(...input: string[]): void;
    logNetwork(req: any, res: any, next: any): void;
    getBoundServices(): any;
    createWinstonTransport(options: any): {
        [x: string]: any;
        log(info: any, callback: any): void;
    };
    forceLogger(logger: framework): void;
    overrideNetworkField(field: string, value: string): boolean;
    overrideCustomFieldFormat(value: customFieldsFormat): void;
    setLogPattern(): void;
}
