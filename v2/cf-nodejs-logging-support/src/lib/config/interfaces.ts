export interface MergedConfig {
    fields: ConfigField[];
    customFieldsFormat: customFieldsFormat;
    outputStartupMsg: boolean;
}

export interface ConfigObject {
    fields?: ConfigField[];
    customFieldsFormat?: customFieldsFormat;
    outputStartupMsg?: boolean;
}

export interface ConfigField {
    name: string;
    mandatory?: boolean;
    envVarRedact?: string;
    envVarSwitch?: string;
    source?: Source;
    default?: string | number;
    output?: outputs[];
    disable?: boolean;
}

interface Source {
    type: sources;
    value?: string;
    path?: string[];
    name?: string;
}

// to do: change types
type sources = "static" | "env" | "nested-env" | "self" | "header" | "field" | "time" |  "special";

type outputs = "msg-log" | "req-log";

export type customFieldsFormat = "application-logging" | "cloud-logging";
