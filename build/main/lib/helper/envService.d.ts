export default class EnvService {
    private static instance;
    private jsonHelper;
    constructor();
    static getInstance(): EnvService;
    getRuntimeName(): string;
    getBoundServices(): any;
}
