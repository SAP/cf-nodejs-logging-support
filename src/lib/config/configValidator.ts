import Ajv, { ValidateFunction } from 'ajv';

import ConfigSchema from './default/config-schema.json';

export default class ConfigValidator {

    private validate: ValidateFunction

    constructor() {
        const ajv = new Ajv({ strict: false });
        this.validate = ajv.compile(ConfigSchema);
    }

    isValid(config: any): true | [false, any] {
        const valid = this.validate(config);
        if (!valid) {
            return [false, this.validate.errors];
        }
        return true;
    }
} 
