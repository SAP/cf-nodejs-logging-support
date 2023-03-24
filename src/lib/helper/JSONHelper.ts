export default class JSONHelper {
    parseJSONSafe(value: string | undefined): any {
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
