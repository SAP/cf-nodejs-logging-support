export * from './lib/core/extern-api-methods';
import { ConfigFile, customFieldsFormat } from './lib/config/interfaces';
import * as coreConfig from './lib/config/config-core.json';
import * as requestConfig from './lib/config/config-request.json';
import * as cfConfig from './lib/config/config-cf.json';
import * as kymaConfig from './lib/config/config-kyma.json';
import * as appLoggingConfig from './lib/config/config-app-logging.json';
import * as cloudLoggingConfig from './lib/config/config-cloud-logging.json';
import { Config } from './lib/config/config';
import * as EnvManagement from './lib/core/env-management';

let config = new Config(
    coreConfig as ConfigFile,
    requestConfig as ConfigFile
);
let env = EnvManagement.getEnv();
let boundServices = EnvManagement.getBoundServices();

if (env == "CF") {
    config.addConfig([cfConfig as ConfigFile]);
}

if (env == "Kyma") {
    config.addConfig([kymaConfig as ConfigFile]);;
}

if (boundServices["application-logging"]) {
    config.addConfig([appLoggingConfig as ConfigFile]);
}

if (boundServices["cloud-logging"]) {
    config.addConfig([cloudLoggingConfig as ConfigFile]);
}

export function addConfig(...configs: ConfigFile[]) {
    return config.addConfig(configs);
}

export function getConfig() {
    return config.getConfig();
}

export function getFields(...fieldNames: string[]) {
    return config.getFields(fieldNames);
}

export function getCoreFields() {
    return config.getCoreFields();
}

export function getReqFields() {
    return config.getReqFields();
}

export function getDeactivatedFields() {
    return config.getDeactivatedFields();
}

export function setCustomFieldsFormat(format: customFieldsFormat) {
    return config.setCustomFieldsFormat(format);
}

export function setStartupMessageEnabled(enabled: boolean) {
    return config.setStartupMessageEnabled(enabled);
}
