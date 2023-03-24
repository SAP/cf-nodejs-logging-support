import JSONHelper from './jsonHelper';

export default class EnvService {

    static getRuntimeName(): string {
        return process.env.VCAP_SERVICES ? "CF" : "Kyma";
    }

    static getBoundServices() {
        const boundServices = JSONHelper.parseJSONSafe(process.env.VCAP_SERVICES);
        return boundServices;
    }
} 
