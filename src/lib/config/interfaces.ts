export interface ConfigObject {
    fields?: ConfigField[];
    customFieldsFormat?: CustomFieldsFormat;
    customFieldsTypeConversion?: CustomFieldsTypeConversion;
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
    Express = "express",
    Restify = "restify",
    Connect = "connect",
    Fastify = "fastify",
    NodeJsHttp = "plainhttp"
}

export enum Output {
    MsgLog = "msg-log",
    ReqLog = "req-log"
}

export enum CustomFieldsFormat {
    ApplicationLogging = "application-logging",
    CloudLogging = "cloud-logging",
    All = "all",
    Disabled = "disabled",
    Default = "default"
}

export enum CustomFieldsTypeConversion {
    Retain = "retain",
    Stringify = "stringify"
}

export enum SourceType {
    Static = "static",
    Env = "env",
    ConfigField = "config-field",
    ReqHeader = "req-header",
    ResHeader = "res-header",
    ReqObject = "req-object",
    ResObject = "res-object",
    Detail = "detail",
    UUID = "uuid"
}

export enum DetailName {
    RequestReceivedAt = "requestReceivedAt",
    ResponseSentAt = "responseSentAt",
    ResponseTimeMs = "responseTimeMs",
    WrittenAt = "writtenAt",
    WrittenTs = "writtenTs",
    Message = "message",
    Stacktrace = "stacktrace",
    RawStacktrace = "rawStacktrace",
    ErrorName = "errorName",
    ErrorMessage = "errorMessage",
    Level = "level"
}


export enum Conversion {
    ToString = "toString",
    ParseInt = "parseInt",
    ParseFloat = "parseFloat",
    ParseBoolean = "parseBoolean"
}
