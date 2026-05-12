const assert = require('chai').assert;
const { execSync } = require('child_process');
const { ROOT, BUILD_CJS_INDEX, BUILD_ESM_INDEX } = require('../paths');
const LOG_MESSAGE = 'module-format-test-message';

describe('Module format compatibility', function () {
    this.slow(1000); // suppress slow-test warnings; each test spawns a Node process

    describe('CJS: require()', function () {
        it('returns the logger instance directly (backward compat)', function () {
            const result = execSync(
                `node -e "const log = require('${BUILD_CJS_INDEX}'); process.stdout.write(typeof log.info + ':' + typeof log.error + ':' + typeof log.logMessage + '\\n')"`,
                { encoding: 'utf8' }
            );
            const [infoType, errorType, logMessageType] = result.trim().split(':');
            assert.equal(infoType, 'function', 'logger should have info()');
            assert.equal(errorType, 'function', 'logger should have error()');
            assert.equal(logMessageType, 'function', 'logger should have logMessage()');
        });

        it('logs messages to stdout', function () {
            const result = execSync(
                `node -e "const log = require('${BUILD_CJS_INDEX}'); log.info('${LOG_MESSAGE}')"`,
                { encoding: 'utf8' }
            );
            assert.include(result, LOG_MESSAGE, 'log.info should write the message to stdout');
        });

        it('exposes named exports (Level, Logger, …) on the module', function () {
            const mod = require(BUILD_CJS_INDEX);
            assert.isDefined(mod.Level, 'Level enum should be accessible');
            assert.isDefined(mod.Logger, 'Logger class should be accessible');
        });

        it('resolves to build/cjs/index.js via package exports field', function () {
            // Resolve via Node's require.resolve using the package's own exports field
            const resolved = require.resolve(ROOT + '/package.json');
            const pkg = require(resolved);
            assert.include(pkg.exports['.'].require.default, 'build/cjs/index.js');
        });
    });

    describe('ESM: import', function () {
        it('exports the logger instance as default', function () {
            const result = execSync(
                `node --input-type=module -e "import log from '${BUILD_ESM_INDEX}'; process.stdout.write(typeof log.info + ':' + typeof log.error + ':' + typeof log.logMessage + '\\n')"`,
                { encoding: 'utf8' }
            );
            const [infoType, errorType, logMessageType] = result.trim().split(':');
            assert.equal(infoType, 'function', 'logger should have info()');
            assert.equal(errorType, 'function', 'logger should have error()');
            assert.equal(logMessageType, 'function', 'logger should have logMessage()');
        });

        it('logs messages to stdout', function () {
            const result = execSync(
                `node --input-type=module -e "import log from '${BUILD_ESM_INDEX}'; log.info('${LOG_MESSAGE}')"`,
                { encoding: 'utf8' }
            );
            assert.include(result, LOG_MESSAGE, 'log.info should write the message to stdout');
        });

        it('exposes named exports (Level, Logger, …) on the module', function () {
            const result = execSync(
                `node --input-type=module -e "import { Level, Logger } from '${BUILD_ESM_INDEX}'; process.stdout.write(typeof Level + ':' + typeof Logger)"`,
                { encoding: 'utf8' }
            );
            const [levelType, loggerType] = result.trim().split(':');
            assert.equal(levelType, 'object', 'Level should be an object (enum)');
            assert.equal(loggerType, 'function', 'Logger should be a class/function');
        });

        it('resolves to build/esm/index.js via package exports field', function () {
            const esmResult = execSync(
                `node --input-type=module -e "const r = await import.meta.resolve('cf-nodejs-logging-support'); process.stdout.write(r)"`,
                { cwd: ROOT, encoding: 'utf8' }
            );
            assert.include(esmResult, 'build/esm/index.js');
        });
    });
});
