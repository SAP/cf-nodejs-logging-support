export default class HttpService {

    static fillReq(req: any): any {
        req.originalUrl = req.originalUrl || req.url;
        return req;
    }
}
