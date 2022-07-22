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

        it.skip('writes log with all core properties', function () {
            const expectedKeys = [
                'component_type',
                'component_id',
                'component_name',
                'component_instance',
                'source_instance',
                'layer',
                'organization_name',
                'organization_id',
                'space_name',
                'space_id',
                'container_id',
                'logger'
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

    after(function () {
        log.setLoggingLevel("info");
    })
});
