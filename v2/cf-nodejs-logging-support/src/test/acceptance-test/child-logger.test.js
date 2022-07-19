var expect = require('chai').expect;
const importFresh = require('import-fresh');

var log;
var lastOutput;
var logCount;
var childLogger;

describe('Test child logger', function () {

    beforeEach(function () {
        log = importFresh("../../../build/main/index");

        lastOutput = "";
        logCount = 0;
        childLogger = "";

        log.setSinkFunction(function (level, output) {
            lastLevel = level;
            lastOutput = JSON.parse(output);
            logCount++;

        });
    });

    describe('Create child logger with new custom field', function () {

        beforeEach(function () {
            childLogger = log.createLogger({ "child-field": "value" });
            childLogger.logMessage("info", "test-message");
        });

        it('is an object', function () {
            expect(childLogger).to.be.an('object');
        });

        it('is not the same object as parent', function () {
            expect(childLogger == log).to.be.false;
        });

        it('logs with new custom field', function () {
            expect(lastOutput).to.have.property('child-field', 'value');
        });

        it('implements info()', function () {
            expect(childLogger.info).to.be.a('function');
        });

        it('implements logMessage()', function () {
            expect(childLogger.logMessage).to.be.a('function');
        });

        it('implements isLoggingLevel()', function () {
            expect(childLogger.isLoggingLevel).to.be.a('function');
        });

        it.skip('implements getCorrelationId()', function () {
            expect(childLogger.getCorrelationId).to.be.a('function');
        });

        it.skip('implements setCorrelationId()', function () {
            expect(childLogger.setCorrelationId).to.be.a('function');
        });

        it.skip('implements setTenantId()', function () {
            expect(childLogger.setTenantId).to.be.a('function');
        });

        it.skip('implements getTenantId()', function () {
            expect(childLogger.getTenantId).to.be.a('function');
        });

        it.skip('implements setTenantSubdomain()', function () {
            expect(childLogger.setTenantSubdomain).to.be.a('function');
        });

        it.skip('implements getTenantSubdomain()', function () {
            expect(childLogger.getTenantSubdomain).to.be.a('function');
        });

        it.skip('implements setDynamicLoggingLevel()', function () {
            expect(childLogger.setDynamicLoggingLevel).to.be.a('function');
        });

        it('implements setLoggingLevel()', function () {
            expect(childLogger.setLoggingLevel).to.be.a('function');
        });

        it('implements getLoggingLevel()', function () {
            expect(childLogger.getLoggingLevel).to.be.a('function');
        });

        it('implements setCustomFields()', function () {
            expect(childLogger.setCustomFields).to.be.a('function');
        });

        it('implements createLogger()', function () {
            expect(childLogger.createLogger).to.be.a('function');
        });
    });

    describe('Test convenience method', function () {

        beforeEach(function () {
            childLogger = log.createLogger();
            childLogger.warn("test-message");
        });

        it('logs in warn level', function () {
            expect(lastOutput).to.have.property('level', 'warn');
        });

        it('logs with a message', function () {
            expect(lastOutput).to.have.property('msg', 'test-message');
        });
    });

    describe('Set logging level threshold per child logger', function () {

        describe('Child logger sets treshold', function () {

            beforeEach(function () {
                childLogger = log.createLogger();
                childLogger.setLoggingLevel('debug');
                childLogger.logMessage("debug", "test-message");
            });

            it('logs in debug level', function () {
                expect(lastOutput).to.have.property('msg', 'test-message');
            });
        });

        describe('Parent logger is not affected', function () {

            beforeEach(function () {
                childLogger = log.createLogger();
                childLogger.setLoggingLevel('error');
                log.logMessage("info", "test-message");
            });

            it('parent logs in info level', function () {
                expect(lastOutput).to.have.property('msg', 'test-message');
            });
        });
    });
});
