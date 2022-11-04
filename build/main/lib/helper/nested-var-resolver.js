"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NestedVarResolver {
    static resolveNestedVariable(root, path) {
        // return, if path is empty.
        if (path == null || path.length == 0) {
            return null;
        }
        var rootObj;
        // if root is a string => parse it to an object. Otherwise => use it directly as object.
        if (typeof root === "string") {
            rootObj = JSON.parse(root);
        }
        else if (typeof root === "object") {
            rootObj = root;
        }
        else {
            return null;
        }
        // get value from root object
        var value = rootObj[path[0]];
        // cut first entry of the object path
        path.shift();
        // if the path is not empty, recursively resolve the remaining waypoints.
        if (path.length >= 1) {
            return NestedVarResolver.resolveNestedVariable(value, path);
        }
        // return the resolved value, if path is empty.
        return value;
    }
    ;
}
exports.default = NestedVarResolver;
//# sourceMappingURL=nested-var-resolver.js.map