import JSONHelper from './jsonHelper';

export default class EnvService {
    private static instance: EnvService;
    private jsonHelper: JSONHelper;

    constructor() {
        this.jsonHelper = new JSONHelper()
    }

    static getInstance(): EnvService {
        if (!EnvService.instance) {
            EnvService.instance = new EnvService();
        }

        return EnvService.instance;
    }

    getRuntimeName(): string {
        return process.env.VCAP_SERVICES ? "CF" : "Kyma";
    }

    getBoundServices() {
        const boundServices = this.jsonHelper.parseJSONSafe(process.env.VCAP_SERVICES);
        return boundServices;
    }
} 
