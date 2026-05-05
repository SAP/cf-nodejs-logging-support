const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const BUILD_CJS_INDEX = path.join(ROOT, 'build/cjs/index.js');
const BUILD_CJS_LIB = path.join(ROOT, 'build/cjs/lib');
const BUILD_ESM_INDEX = path.join(ROOT, 'build/esm/index.js');

module.exports = { ROOT, BUILD_CJS_INDEX, BUILD_CJS_LIB, BUILD_ESM_INDEX };
