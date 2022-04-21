import ConfigShema from "./config-schema.json";
import Ajv from "ajv";

export default class ConfigValidator {

    private static ajv = new Ajv();

    static isValid(config: any): true | [false, any] {
        const validate = ConfigValidator.ajv.compile(ConfigShema);
        const valid = validate(config);
        if (!valid) {
            return [false, validate.errors];
        }
        return true;
    }
} 
