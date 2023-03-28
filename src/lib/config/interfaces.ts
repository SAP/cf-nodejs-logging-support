export interface ConfigObject {
    fields?: ConfigField[];
    customFieldsFormat?: CustomFieldsFormat;
    outputStartupMsg?: boolean;
    reqLoggingLevel?: string;
    framework?: Framework;
}

export interface ConfigField {
    name: string;
    envVarRedact?: string;
    envVarSwitch?: string;
    source?: Source | Source[];
    output: Output[];
    convert?: Conversion;
    disable?: boolean;
    default?: string | number | boolean;
    isContext?: boolean;
    settable?: boolean;
    _meta?: ConfigFieldMeta;
}

export interface Source {
    type: SourceType;
    value?: string;
    path?: string[];
    fieldName?: string;
    varName?: string;
    detailName?: DetailName;
    regExp?: string;
    framework?: Framework;
    output?: Output;
}

export interface ConfigFieldMeta {
    isRedacted: boolean;
    isEnabled: boolean;
    isCache: boolean;
    isContext: boolean;
}

export enum Framework {
    express = "express",
    restify = "restify",
    connect = "connect",
    nodejsHttp = "plainhttp"    
}

export enum Output {
    msgLog = "msg-log",
    reqLog = "req-log"
}

export enum CustomFieldsFormat {
    applicationLogging = "application-logging",
    cloudLogging = "cloud-logging",
    all = "all",
    disabled = "disabled",
    default = "default"
}

export enum SourceType {
    static = "static",
    env = "env",
    configField = "config-field",
    reqHeader = "req-header",
    resHeader = "res-header",
    reqObject = "req-object",
    resObject = "res-object",
    detail = "detail",
    uuid = "uuid"
}

export enum DetailName {
    requestReceivedAt = "requestReceivedAt",
    responseSentAt = "responseSentAt",
    responseTimeMs = "responseTimeMs",
    writtenAt = "writtenAt",
    writtenTs = "writtenTs",
    message = "message",
    stacktrace = "stacktrace",
    level = "level"
}


export enum Conversion {
    toString = "toString",
    parseInt = "parseInt",
    parseFloat = "parseFloat",
    parseBoolean = "parseBoolean"
}
