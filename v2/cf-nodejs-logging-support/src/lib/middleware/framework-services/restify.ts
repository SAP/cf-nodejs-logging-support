export default class RestifyService {

    static fillReq(req: any): any {
        req.originalUrl = req.originalUrl || req.url;
        return req;
    }

    static fillRes(res: any): any {
        if (res.get == null) {
            res.get = function () {
                return "";
            };
        }
        return res;
    }
}
