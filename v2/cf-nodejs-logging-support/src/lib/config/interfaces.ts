export interface ConfigObject {
    fields?: ConfigField[];
    settableFields?: string[];
    customFieldsFormat?: customFieldsFormat;
    outputStartupMsg?: boolean;
    reqLoggingLevel?: string;
    framework?: framework;
}

export interface ConfigField {
    name: string;
    envVarRedact?: string;
    envVarSwitch?: string;
    source: Source | Source[];
    output: outputs[];
    disable?: boolean;
    default?: string | number | boolean;
    isContext?: boolean;
    settable?: boolean;
    _meta?: ConfigFieldMeta;
}

export interface Source {
    type: sources;
    value?: string;
    path?: string[];
    name?: string;
    framework?: framework;
    regExp?: string;
}


interface ConfigFieldMeta {
    isRedacted: boolean;
    isEnabled: boolean;
    isCache: boolean;
    isContext: boolean;
}

type sources = "static" | "env" | "config-field" | "req-header" | "res-header" | "req-object" | "res-object" | "meta" | "uuid";
export type outputs = "msg-log" | "req-log";

export type framework = "express" | "restify" | "connect" | "nodejs-http";

export type customFieldsFormat = "application-logging" | "cloud-logging" | "all" | "disabled" | "default";
