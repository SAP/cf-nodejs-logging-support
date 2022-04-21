export default class JSONHelper {
    static parseJSONSafe(value: string | undefined): any {
        let tmp = {};
        if (value) {
            try {
                tmp = JSON.parse(value);
            } catch (e) {
                tmp = {};
            }
        }
        return tmp;
    }
}
