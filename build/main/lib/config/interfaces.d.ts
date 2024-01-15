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
export declare enum Framework {
    Express = "express",
    Restify = "restify",
    Connect = "connect",
    NodeJsHttp = "plainhttp"
}
export declare enum Output {
    MsgLog = "msg-log",
    ReqLog = "req-log"
}
export declare enum CustomFieldsFormat {
    ApplicationLogging = "application-logging",
    CloudLogging = "cloud-logging",
    All = "all",
    Disabled = "disabled",
    Default = "default"
}
export declare enum SourceType {
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
export declare enum DetailName {
    RequestReceivedAt = "requestReceivedAt",
    ResponseSentAt = "responseSentAt",
    ResponseTimeMs = "responseTimeMs",
    WrittenAt = "writtenAt",
    WrittenTs = "writtenTs",
    Message = "message",
    Stacktrace = "stacktrace",
    Level = "level"
}
export declare enum Conversion {
    ToString = "toString",
    ParseInt = "parseInt",
    ParseFloat = "parseFloat",
    ParseBoolean = "parseBoolean"
}
