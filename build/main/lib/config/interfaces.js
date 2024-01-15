"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversion = exports.DetailName = exports.SourceType = exports.CustomFieldsFormat = exports.Output = exports.Framework = void 0;
var Framework;
(function (Framework) {
    Framework["Express"] = "express";
    Framework["Restify"] = "restify";
    Framework["Connect"] = "connect";
    Framework["NodeJsHttp"] = "plainhttp";
})(Framework || (exports.Framework = Framework = {}));
var Output;
(function (Output) {
    Output["MsgLog"] = "msg-log";
    Output["ReqLog"] = "req-log";
})(Output || (exports.Output = Output = {}));
var CustomFieldsFormat;
(function (CustomFieldsFormat) {
    CustomFieldsFormat["ApplicationLogging"] = "application-logging";
    CustomFieldsFormat["CloudLogging"] = "cloud-logging";
    CustomFieldsFormat["All"] = "all";
    CustomFieldsFormat["Disabled"] = "disabled";
    CustomFieldsFormat["Default"] = "default";
})(CustomFieldsFormat || (exports.CustomFieldsFormat = CustomFieldsFormat = {}));
var SourceType;
(function (SourceType) {
    SourceType["Static"] = "static";
    SourceType["Env"] = "env";
    SourceType["ConfigField"] = "config-field";
    SourceType["ReqHeader"] = "req-header";
    SourceType["ResHeader"] = "res-header";
    SourceType["ReqObject"] = "req-object";
    SourceType["ResObject"] = "res-object";
    SourceType["Detail"] = "detail";
    SourceType["UUID"] = "uuid";
})(SourceType || (exports.SourceType = SourceType = {}));
var DetailName;
(function (DetailName) {
    DetailName["RequestReceivedAt"] = "requestReceivedAt";
    DetailName["ResponseSentAt"] = "responseSentAt";
    DetailName["ResponseTimeMs"] = "responseTimeMs";
    DetailName["WrittenAt"] = "writtenAt";
    DetailName["WrittenTs"] = "writtenTs";
    DetailName["Message"] = "message";
    DetailName["Stacktrace"] = "stacktrace";
    DetailName["Level"] = "level";
})(DetailName || (exports.DetailName = DetailName = {}));
var Conversion;
(function (Conversion) {
    Conversion["ToString"] = "toString";
    Conversion["ParseInt"] = "parseInt";
    Conversion["ParseFloat"] = "parseFloat";
    Conversion["ParseBoolean"] = "parseBoolean";
})(Conversion || (exports.Conversion = Conversion = {}));
//# sourceMappingURL=interfaces.js.map