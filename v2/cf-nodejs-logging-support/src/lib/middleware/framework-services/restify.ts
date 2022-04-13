import { Request, Response } from 'restify';

export default class RestifyService {

    // static fillReq(req: Request): Request {
    //     req.originalUrl = req.originalUrl || req.url;
    //     return req;
    // }

    // static fillRes(res: Response): Response {
    //     if (res.get == null) {
    //         res.get = function () {
    //             return "";
    //         };
    //     }
    //     return res;
    // }

    static getReqHeaderField(_req: Request, fieldName: string): string {
        return "";
    }

    static getReqField(_req: Request, fieldName: string): string {
        return "";
    }

    static getResHeaderField(_res: Response, fieldName: string): string {
        return "";
    }

    static getResField(_res: Response, fieldName: string): string {
        return "";
    }
}
