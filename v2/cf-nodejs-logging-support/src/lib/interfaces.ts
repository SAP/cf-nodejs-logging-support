export interface ConfigFile {
    config: ConfigField[];
}

export interface CustomConfigFile {
    config: ConfigField[];
}

export interface ConfigField {
    name: string;
    mandatory?: boolean;
    envVarRedact?: string;
    envVarSwitch?: string;
    source?: Source;
    default?: string | number;
    output?: outputs[];
    deactivated?: boolean;
}

interface Source {
    type: sources;
    value?: string;
    path?: string[];
    name?: string;
}

type sources = "static" | "env" | "nested-env" | "self" | "header" | "field" | "time" |  "special";

type outputs = "log" | "request-log";
