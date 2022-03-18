export * from './lib/core/extern-api-methods';
import { ConfigFile } from './lib/interfaces';
import * as coreConfig from './lib/config/config-core.json';
import * as requestConfig from './lib/config/config-request.json';
import * as customConfig from './lib/config/config-custom-test.json';
import { Config } from './lib/config/config';
let config = new Config(
    coreConfig as ConfigFile,
    requestConfig as ConfigFile,
    customConfig as ConfigFile
);
console.info(config.getConfig());
