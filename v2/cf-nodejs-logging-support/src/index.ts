export * from './lib/core/extern-api-methods';
import { ConfigFile } from './lib/interfaces';
import * as coreConfig from './lib/config/config-core.json';
import * as requestConfig from './lib/config/config-request.json';
import { Config } from './lib/config/config';

let config = new Config(
    coreConfig as ConfigFile,
    requestConfig as ConfigFile
);

export function addConfig(...configs: ConfigFile[]) {
    return config.addConfig(configs);
}

export function getConfig(...fieldNames: string[]) {
    return config.getConfig(fieldNames);
}

export function getCoreConfig() {
    return config.getCoreConfig();
}

export function getReqConfig() {
    return config.getReqConfig();
}

export function getDeactivatedFields() {
    return config.getDeactivatedFields();
}
