import { FrameworkService } from "../interfaces";
export default class ConnectService implements FrameworkService {
    getReqHeaderField(req: any, fieldName: string): string;
    getReqField(req: any, fieldName: string): any;
    getResHeaderField(res: any, fieldName: string): string;
    getResField(res: any, fieldName: string): any;
}
