export function getEnv() : string {
    return process.env.VCAP_SERVICES ? "CF" : "Kyma";
}

export function getBoundServices() {
    let boundServices = parseJSONSafe(process.env.VCAP_SERVICES);
    return boundServices;
}

function parseJSONSafe(value: string | undefined): any {
    let tmp = {};
    if (value) {
        try {
            tmp = JSON.parse(value);
        } catch (e) {
            tmp = {};
        }
    }
    return tmp;
}
