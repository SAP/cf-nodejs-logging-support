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
            log.registerCustomFields(["child-field"]);
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

        it('implements getCorrelationId()', function () {
            expect(childLogger.getCorrelationId).to.be.a('function');
        });

        it('implements setCorrelationId()', function () {
            expect(childLogger.setCorrelationId).to.be.a('function');
        });

        it('implements setTenantId()', function () {
            expect(childLogger.setTenantId).to.be.a('function');
        });

        it('implements getTenantId()', function () {
            expect(childLogger.getTenantId).to.be.a('function');
        });

        it('implements setTenantSubdomain()', function () {
            expect(childLogger.setTenantSubdomain).to.be.a('function');
        });

        it('implements getTenantSubdomain()', function () {
            expect(childLogger.getTenantSubdomain).to.be.a('function');
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

        it('inherit registered custom fields from parent', function () {
            expect(childLogger.registeredCustomFields).to.eql(log.registeredCustomFields);
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

    describe('Test context features', function () {

        describe('Create child logger without context', function () {

            beforeEach(function () {
                childLogger = log.createLogger();
            });

            it('cannot set context properties', function () {
                expect(childLogger.setContextProperty('some-field', 'some-value')).to.be.false;
            });
    
            it('does not log a custom context property', function () {
                childLogger.setContextProperty('some-field', 'some-value');
                childLogger.warn('test-message');
                expect(lastOutput).to.not.include.key('some-field');
            });
    
            it('does not log the correlation_id', function () {
                childLogger.warn("test-message");
                expect(lastOutput).to.not.include.key('correlation_id');
            });
        });

        describe('Create child logger with new context', function () {

            beforeEach(function () {
                childLogger = log.createLogger(null, true);
            });

            it('sets context properties', function () {
                expect(childLogger.setContextProperty('some-field', 'some-value')).to.be.true;
            });
    
            it('logs a custom context property', function () {
                childLogger.setContextProperty('some-field', 'some-value');
                childLogger.warn('test-message');
                expect(lastOutput).to.include.property('some-field', 'some-value');
            });

            it('inherits the context', function () {
                childLogger.setContextProperty('some-field', 'some-value');
                childLogger.createLogger().warn('test-message');
                expect(lastOutput).to.include.property('some-field', 'some-value');
            });
    
            it('generates a correlation_id', function () {
                childLogger.warn("test-message");
                expect(lastOutput).to.include.key('correlation_id');
                expect(lastOutput.correlation_id).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/);
            });
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
