export default class ConnectService {

    static fillReq(req: any): any {
        if (typeof req.getHeader != "function") {
            req.getHeader = function (header: any) {
                return this.headers[header.toLocaleLowerCase()];
            };
        }
        return req;
    }
}
