import TransportStream from 'winston-transport';
import { Logger } from '../logger/logger';
declare class CfNodejsLoggingSupportLogger extends TransportStream {
    logger: Logger;
    constructor(options: any);
    log(info: any, callback: () => void): void;
}
export default function createTransport(options: any): CfNodejsLoggingSupportLogger;
export {};
