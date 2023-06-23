const assert = require('chai').assert;
const expect = require('chai').expect;
const importFresh = require('import-fresh');

var log;
var lastLevel;
var lastOutput;
var logCount;

describe('Test logging in global context', function () {

    beforeEach(function () {
        log = importFresh("../../../build/main/index");

        logCount = 0;
        lastLevel = "";
        lastOutput = "";

        log.setSinkFunction((level, output) => {
            lastLevel = level;
            lastOutput = JSON.parse(output);
            logCount++;
        });
    });

    describe('Write a log with a simple message', function () {
        beforeEach(function () {
            log.logMessage("info", "test-message");
        });

        it('writes exactly one log', function () {
            assert.equal(logCount, 1);
        });

        it('writes a log containing with the message', function () {
            assert(lastOutput.msg, "test-message");
        });

        it('writes with level info', function () {
            expect(lastOutput).to.have.property('level', 'info');
        });

        it('writes log with all core properties', function () {
            const expectedKeys = [
                'logger',
                'written_at',
                'written_ts'
            ];
            expect(lastOutput).to.include.all.keys(expectedKeys);
        });
    });

    describe('Write a log with convenience method', function () {

        beforeEach(function () {
            log.error("Error message logged in global context");
        });

        it('writes a log containing the message', function () {
            assert(lastOutput.msg, "Error message logged in global context");
        });

        it('check log level', function () {
            expect(lastOutput).to.have.property('level', 'error');
        });
    });

    describe('Has convenience methods', function () {

        it('error', function () {
            expect(log.error).to.be.a('function');
        });

        it('warn', function () {
            expect(log.warn).to.be.a('function');
        });

        it('info', function () {
            expect(log.info).to.be.a('function');
        });

        it('verbose', function () {
            expect(log.verbose).to.be.a('function');
        });

        it('debug', function () {
            expect(log.debug).to.be.a('function');
        });

        it('silly', function () {
            expect(log.silly).to.be.a('function');
        });

    });

    describe('Write message with formating', function () {
        beforeEach(function () {
            log.logMessage("info", "Listening on test port %d", 5000);
        });

        it('writes exactly one log', function () {
            assert.equal(logCount, 1);
        });

        it('writes a log containing the message', function () {
            assert(lastOutput.msg, "Listening on test port 5000");
        });
    });

    describe('overrideNetworkField', function () {

        beforeEach(function () {
            log.overrideNetworkField("logger", "new-value");
            log.logMessage("info", "test-message");
        });

        it('overrides field', function () {
            expect(lastOutput).to.have.property('logger', 'new-value');
        });


        afterEach(function () {
            log.overrideNetworkField("logger", "TEST");
        })
    });

    describe('Test regExp constraint', function () {
        beforeEach(function () {
            log.logMessage("info", "test-message");
        });

        it('writes field with correct uuid format', function () {
            expect(lastOutput).to.have.property('uuid_field');
        });

        it('does not write field with incorrect uuid format', function () {
            expect(lastOutput).to.not.have.property('will_never_log');
        });
    });

    describe('Set log severity level', function () {

        beforeEach(function () {
            log.setLoggingLevel("error");
            log.logMessage("info", "test-message");
        });

        it('Does not write log', function () {
            expect(logCount).to.be.eql(0);
        });
    });

    describe('Check log severity level', function () {

        beforeEach(function () {
            log.setLoggingLevel("error");
        });

        it('Checks with isLoggingLevel()', function () {
            var isErrorActive = log.isLoggingLevel("error");
            expect(isErrorActive).to.be.true;
        });

        it('Checks with convencience method', function () {
            var isDebugActive = log.isDebug();
            expect(isDebugActive).to.be.false;
        });
    });

    describe('Log a stacktrace', function () {

        beforeEach(function () {
            const e = new Error("An error happened.");
            log.error("Error occurred", e);
        });

        it('logs stacktrace field', function () {
            expect(lastOutput).to.have.property('stacktrace');
            expect(lastOutput.stacktrace).to.be.an('array');
            var isArrayOfStrings = lastOutput.stacktrace.every(x => typeof (x) === 'string');
            expect(isArrayOfStrings).to.be.true;
        });

    });

    describe('Test disabled context', function () {

        it('cannot set context properties', function () {
            expect(log.setContextProperty("some-field", "some-value")).to.be.false;
        });

        it('cannot set the correlation_id', function () {
            expect(log.setCorrelationId("f79ed23f-cff6-4599-8668-12838c898b70")).to.be.false;
        });

        it('cannot set the tenant_id', function () {
            expect(log.setTenantId("some-value")).to.be.false;
        });

        it('cannot set the correlation_id', function () {
            expect(log.setTenantSubdomain("some-value")).to.be.false;
        });

    });

    after(function () {
        log.setLoggingLevel("info");
    })
});
