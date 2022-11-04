import { IFrameworkService } from "../interfaces";
export default class ExpressService implements IFrameworkService {
    getReqHeaderField(req: any, fieldName: string): string;
    getReqField(req: any, fieldName: string): string;
    getResHeaderField(res: any, fieldName: string): string;
    getResField(res: any, fieldName: string): string;
}
