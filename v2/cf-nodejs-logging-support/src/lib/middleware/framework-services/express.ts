import { Request, Response } from 'express';

// interface CustomRequest extends Request {
//     header: any;
// }

// interface CustomResponse extends Response {
//     header: any;
// }

export default class ExpressService {

    // static fillReq(_req: Request): CustomRequest {
    //     const req = _req as CustomRequest;
    //     //rendering the given arguments failsafe against missing fields
    //     if (typeof req.header != "function") {
    //         req as CustomRequest;
    //         req.header = function () {
    //             return "";
    //         };
    //     }
    //     return req;
    // }

    // static fillRes(_res: Response): Response {
    //     const req = _res as CustomRequest;

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
