export interface ConfigObject {
    fields?: ConfigField[];
    customFieldsFormat?: customFieldsFormat;
    outputStartupMsg?: boolean;
    framework?: framework;
}

export interface ConfigField {
    name: string;
    mandatory?: boolean;
    envVarRedact?: string;
    envVarSwitch?: string;
    source: Source | Source[];
    output?: outputs[];
    disable?: boolean;
    default?: string;
    _meta?: ConfigFieldMeta
}

export interface Source {
    type: sources;
    value?: string;
    path?: string[];
    name?: string;
    framework?: framework;
}


interface ConfigFieldMeta {
    isRedacted: boolean;
    isEnabled: boolean;
}

type sources = "static" | "env" | "config-field" | "req-header" | "res-header" | "req-object" | "res-object" | "meta" | "uuid";
type outputs = "msg-log" | "req-log";

export type framework = "express" | "restify" | "connect" | "nodejs-http";

export type customFieldsFormat = "application-logging" | "cloud-logging";
