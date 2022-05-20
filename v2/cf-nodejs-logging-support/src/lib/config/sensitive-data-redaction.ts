import { ConfigField } from "./interfaces";

export class SensitiveDataService {
    REDUCED_PLACEHOLDER = "redacted";

    constructor() {

    }

    isReducedField(field: ConfigField): boolean {

        var val = field.envVarRedact ? process.env[field.envVarRedact!] : process.env[field.envVarSwitch!];
        var isActivated = (val == "true" || val == "True" || val == "TRUE");
        if (isActivated) {
            return false;
        }
        return true;
    }

    getReducedValue(field: ConfigField) {
        if (field.envVarRedact) {
            return this.REDUCED_PLACEHOLDER;
        }
        return;
    }
}
