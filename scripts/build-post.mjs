import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Write package.json type markers so Node.js treats each build correctly
writeFileSync('build/cjs/package.json', '{"type":"commonjs"}\n');
writeFileSync('build/esm/package.json', '{"type":"module"}\n');

// Generate a CJS-specific type declaration file using `export =` syntax so
// that `const log = require('cf-nodejs-logging-support')` is typed as the
// logger instance directly (RootLogger) instead of the module namespace object.
// TypeScript 4.7+ picks this up via the "require"."types" exports condition.
const cjsDts = `import type RootLogger from "./lib/logger/rootLogger.js";
declare const rootLogger: RootLogger;
export = rootLogger;
`;
writeFileSync('build/cjs/index.d.cts', cjsDts);

// Append CJS backward-compatibility shim to build/cjs/index.js so that
// `require('cf-nodejs-logging-support')` returns the logger instance directly
// (instead of the module namespace object with a `.default` property).
const cjsIndex = 'build/cjs/index.js';
const shim = `
// CJS backward compatibility: expose the default export as the module itself
module.exports = exports["default"];
Object.assign(module.exports, exports);
module.exports["default"] = exports["default"];
`;
writeFileSync(cjsIndex, readFileSync(cjsIndex, 'utf8') + shim);

// Post-process ESM output: add `with { type: 'json' }` to JSON imports.
// TypeScript does not emit this attribute automatically, but Node.js ESM
// requires it when importing .json files natively.
function addJsonImportAttributes(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            addJsonImportAttributes(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const original = readFileSync(fullPath, 'utf8');
            // Match: from './foo.json' or from "./foo.json" — not already followed by 'with'
            const patched = original.replace(
                /(from\s+(['"])[^'"]*\.json\2)(?!\s*with)/g,
                '$1 with { type: "json" }'
            );
            if (patched !== original) {
                writeFileSync(fullPath, patched);
            }
        }
    }
}
addJsonImportAttributes('build/esm');

console.log('build-post: package.json markers written, CJS shim and ESM JSON attributes applied.');
