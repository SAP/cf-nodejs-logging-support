"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnvVarHelper {
    static getInstance() {
        if (!EnvVarHelper.instance) {
            EnvVarHelper.instance = new EnvVarHelper();
        }
        return EnvVarHelper.instance;
    }
    isVarEnabled(name) {
        const value = process.env[name];
        return (value == "true" || value == "True" || value == "TRUE");
    }
    resolveNestedVar(path) {
        const copiedPath = [...path];
        return this.resolve(process.env, copiedPath);
    }
    resolve(root, path) {
        // return, if path is empty.
        if (path == null || path.length == 0) {
            return undefined;
        }
        let rootObj;
        // if root is a string => parse it to an object. Otherwise => use it directly as object.
        if (typeof root === "string") {
            rootObj = JSON.parse(root);
        }
        else if (typeof root === "object") {
            rootObj = root;
        }
        else {
            return undefined;
        }
        // get value from root object
        let value = rootObj[path[0]];
        // cut first entry of the object path
        path.shift();
        // if the path is not empty, recursively resolve the remaining waypoints.
        if (path.length >= 1) {
            return this.resolve(value, path);
        }
        // return the resolved value, if path is empty.
        return value;
    }
}
exports.default = EnvVarHelper;
//# sourceMappingURL=envVarHelper.js.map