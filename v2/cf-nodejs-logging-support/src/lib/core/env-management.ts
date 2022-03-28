import Helper from '../Helper';

export default class EnvManagement {

    static getEnv(): string {
        return process.env.VCAP_SERVICES ? "CF" : "Kyma";
    }
    
    static getBoundServices() {
        let boundServices = Helper.parseJSONSafe(process.env.VCAP_SERVICES);
        return boundServices;
    }
} 
