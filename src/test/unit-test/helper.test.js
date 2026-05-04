const { BUILD_CJS_LIB } = require('../paths');
const expect = require('chai').expect;
const JSONHelper = require(`${BUILD_CJS_LIB}/helper/jsonHelper.js`).default;
const LevelUtils = require(`${BUILD_CJS_LIB}/helper/levelUtils.js`).default;
const { Level } = require(`${BUILD_CJS_LIB}/logger/level.js`);
const EnvVarHelper = require(`${BUILD_CJS_LIB}/helper/envVarHelper.js`).default;
const StacktraceUtils = require(`${BUILD_CJS_LIB}/helper/stacktraceUtils.js`).default;

describe('JSONHelper', function () {
    let helper;

    beforeEach(function () {
        helper = new JSONHelper();
    });

    describe('parseJSONSafe', function () {
        it('returns parsed object for valid JSON string', function () {
            const result = helper.parseJSONSafe('{"key":"value"}');
            expect(result).to.deep.equal({ key: 'value' });
        });

        it('returns empty object for invalid JSON string', function () {
            const result = helper.parseJSONSafe('not valid json');
            expect(result).to.deep.equal({});
        });

        it('returns empty object for undefined', function () {
            const result = helper.parseJSONSafe(undefined);
            expect(result).to.deep.equal({});
        });

        it('returns empty object for empty string', function () {
            const result = helper.parseJSONSafe('');
            expect(result).to.deep.equal({});
        });
    });
});

describe('LevelUtils', function () {
    describe('getLevel', function () {
        it('returns correct level for valid lowercase name', function () {
            expect(LevelUtils.getLevel('info')).to.equal(Level.Info);
            expect(LevelUtils.getLevel('error')).to.equal(Level.Error);
            expect(LevelUtils.getLevel('debug')).to.equal(Level.Debug);
        });

        it('returns correct level for mixed case name', function () {
            expect(LevelUtils.getLevel('INFO')).to.equal(Level.Info);
            expect(LevelUtils.getLevel('Error')).to.equal(Level.Error);
        });

        it('returns default level (Info) for unknown level name', function () {
            expect(LevelUtils.getLevel('unknown')).to.equal(Level.Info);
            expect(LevelUtils.getLevel('')).to.equal(Level.Info);
        });
    });

    describe('getName', function () {
        it('returns lowercase name for a level', function () {
            expect(LevelUtils.getName(Level.Info)).to.equal('info');
            expect(LevelUtils.getName(Level.Error)).to.equal('error');
            expect(LevelUtils.getName(Level.Debug)).to.equal('debug');
        });
    });

    describe('isLevelEnabled', function () {
        it('returns false when level is Off', function () {
            expect(LevelUtils.isLevelEnabled(Level.Info, Level.Off)).to.equal(false);
        });

        it('returns false when level is below Off (Inherit)', function () {
            expect(LevelUtils.isLevelEnabled(Level.Info, Level.Inherit)).to.equal(false);
        });

        it('returns true when level is within threshold', function () {
            expect(LevelUtils.isLevelEnabled(Level.Info, Level.Info)).to.equal(true);
            expect(LevelUtils.isLevelEnabled(Level.Debug, Level.Info)).to.equal(true);
        });

        it('returns false when level exceeds threshold', function () {
            expect(LevelUtils.isLevelEnabled(Level.Info, Level.Debug)).to.equal(false);
        });
    });
});

describe('EnvVarHelper', function () {
    let helper;

    beforeEach(function () {
        helper = new EnvVarHelper();
    });

    describe('isVarEnabled', function () {
        afterEach(function () {
            delete process.env.TEST_VAR;
        });

        it('returns true for "true"', function () {
            process.env.TEST_VAR = 'true';
            expect(helper.isVarEnabled('TEST_VAR')).to.equal(true);
        });

        it('returns true for "True"', function () {
            process.env.TEST_VAR = 'True';
            expect(helper.isVarEnabled('TEST_VAR')).to.equal(true);
        });

        it('returns true for "TRUE"', function () {
            process.env.TEST_VAR = 'TRUE';
            expect(helper.isVarEnabled('TEST_VAR')).to.equal(true);
        });

        it('returns false for "false"', function () {
            process.env.TEST_VAR = 'false';
            expect(helper.isVarEnabled('TEST_VAR')).to.equal(false);
        });

        it('returns false for undefined env var', function () {
            expect(helper.isVarEnabled('NONEXISTENT_VAR_12345')).to.equal(false);
        });
    });

    describe('resolveNestedVar', function () {
        afterEach(function () {
            delete process.env.TEST_NESTED_VAR;
        });

        it('resolves a top-level env var value', function () {
            process.env.TEST_NESTED_VAR = '{"name":"test-service"}';
            const result = helper.resolveNestedVar(['TEST_NESTED_VAR', 'name']);
            expect(result).to.equal('test-service');
        });

        it('resolves a deeply nested value', function () {
            process.env.TEST_NESTED_VAR = '{"outer":{"inner":"deep-value"}}';
            const result = helper.resolveNestedVar(['TEST_NESTED_VAR', 'outer', 'inner']);
            expect(result).to.equal('deep-value');
        });

        it('returns undefined for empty path', function () {
            const result = helper.resolveNestedVar([]);
            expect(result).to.be.undefined;
        });

        it('returns undefined when intermediate value is not an object or string', function () {
            process.env.TEST_NESTED_VAR = '{"key":42}';
            // 42 is a number, so resolve returns undefined
            const result = helper.resolveNestedVar(['TEST_NESTED_VAR', 'key', 'nested']);
            expect(result).to.be.undefined;
        });
    });
});

describe('StacktraceUtils', function () {
    let utils;

    beforeEach(function () {
        utils = new StacktraceUtils();
    });

    describe('isErrorWithStacktrace', function () {
        it('returns true for a real Error object', function () {
            const err = new Error('test error');
            expect(utils.isErrorWithStacktrace(err)).to.equal(true);
        });

        it('returns false for a plain object without stack and message', function () {
            expect(utils.isErrorWithStacktrace({})).to.equal(false);
        });

        it('returns false for null', function () {
            expect(utils.isErrorWithStacktrace(null)).to.equal(false);
        });

        it('returns false when stack is not a string', function () {
            expect(utils.isErrorWithStacktrace({ stack: 123, message: 'msg' })).to.equal(false);
        });

        it('returns false when message is not a string', function () {
            expect(utils.isErrorWithStacktrace({ stack: 'trace', message: 42 })).to.equal(false);
        });
    });

    describe('prepareStacktrace', function () {
        it('returns lines as array for a small stacktrace', function () {
            const trace = 'Error: something\n    at foo (foo.js:1:1)\n    at bar (bar.js:2:2)';
            const result = utils.prepareStacktrace(trace);
            expect(result).to.deep.equal(trace.split('\n'));
        });

        it('returns truncated stacktrace when size exceeds 55KB', function () {
            // Create a stacktrace larger than 55*1024 characters
            const line = 'x'.repeat(1000);
            const lines = Array.from({ length: 60 }, (_, i) => `line${i}: ${line}`);
            const bigTrace = lines.join('\n');

            const result = utils.prepareStacktrace(bigTrace);

            expect(result[0]).to.equal('-------- STACK TRACE TRUNCATED --------');
            const omittedLabel = result.find(l => l.startsWith('-------- OMITTED'));
            expect(omittedLabel).to.be.a('string');
            // total lines should be less than original
            expect(result.length).to.be.lessThan(lines.length);
        });

        it('includes OMITTED label with count in truncated stacktrace', function () {
            const line = 'x'.repeat(1000);
            const lines = Array.from({ length: 60 }, (_, i) => `line${i}: ${line}`);
            const bigTrace = lines.join('\n');

            const result = utils.prepareStacktrace(bigTrace);
            const omittedLabel = result.find(l => l.includes('OMITTED') && l.includes('LINES'));
            expect(omittedLabel).to.match(/-------- OMITTED \d+ LINES --------/);
        });
    });
});
