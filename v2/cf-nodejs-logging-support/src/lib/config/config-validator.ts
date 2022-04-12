import ConfigShema from "./config-schema.json";
import Ajv from "ajv";

export default class ConfigValidator {

    private static ajv = new Ajv();

    static isValid(config: any): boolean | Error {
        const validate = ConfigValidator.ajv.compile(ConfigShema);
        const valid = validate(config);
        if (!valid) {
            throw new Error("Something in the configuration file is not valid. Please check.");
        }
        return true;
    }
} 
