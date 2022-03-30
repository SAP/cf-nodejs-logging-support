export default class ExpressService {

    static fillReq(req: any): any {
        //rendering the given arguments failsafe against missing fields
        if (typeof req.header != "function") {
            req.header = function () {
                return "";
            };
        }
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
