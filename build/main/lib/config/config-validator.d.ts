export default class ConfigValidator {
    private static ajv;
    static isValid(config: any): true | [false, any];
}
