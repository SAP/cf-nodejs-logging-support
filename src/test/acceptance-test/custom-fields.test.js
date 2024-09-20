var expect = require('chai').expect;
const importFresh = require('import-fresh');

var log;
var childLogger;
var lastOutput;

describe('Test custom fields', function () {

    beforeEach(function () {
        log = importFresh("../../../build/main/index");

        lastOutput = "";

        log.setSinkFunction(function (level, output) {
            lastOutput = JSON.parse(output);
        });
    });

    describe('Test writing a log with a global custom field', function () {
        beforeEach(function () {
            log.setCustomFields({'field-a': 'value'});
            log.logMessage('info', 'test-message');
        });

        it('writes a log with a custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value');
        });

        it('returns the global custom field', function () {
            expect([ ...log.getCustomFields().keys() ]).to.have.members(['field-a']);
            expect(log.getCustomFields().get('field-a')).to.equal('value');
        });
    });

    describe('Test writing custom fields with a child logger', function () {
        beforeEach(function () {
            log.setCustomFields({'field-a': 'value-a'});
            childLogger = log.createLogger({'field-b': 'value-b'});
            childLogger.logMessage('info', 'test-message', {'field-c': 'value-c'});
        });

        it('writes a log with a global custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value-a');
        });

        it('writes a log with a child logger custom field', function () {
            expect(lastOutput).to.have.property('field-b', 'value-b');
        });

        it('writes a log with a custom field from logMessage call', function () {
            expect(lastOutput).to.have.property('field-c', 'value-c');
        });

        it('returns the global custom field', function () {
            expect([ ...log.getCustomFields().keys() ]).to.have.members(['field-a'])
            expect(log.getCustomFields().get('field-a')).to.equal('value-a');
        });

        it('returns the global and the child logger custom fields', function () {
            expect([ ...childLogger.getCustomFields().keys() ]).to.have.members(['field-a', 'field-b']);
            expect(childLogger.getCustomFields().get('field-a')).to.equal('value-a');
            expect(childLogger.getCustomFields().get('field-b')).to.equal('value-b');
        });
    });

    describe('Test overriding custom fields with a child logger', function () {
        beforeEach(function () {
            log.setCustomFields({'field-a': 'value-a'});
            childLogger = log.createLogger({'field-a': 'value-override-a','field-b': 'value-b'});
            childLogger.logMessage('info', 'test-message', {'field-b': 'value-override-b'});
        });

        it('writes a log with an overridden global custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value-override-a');
        });

        it('writes a log with an overridden child logger custom field', function () {
            expect(lastOutput).to.have.property('field-b', 'value-override-b');
        });

        it('returns the original global custom field', function () {
            expect([ ...log.getCustomFields().keys() ]).to.have.members(['field-a']);
            expect(log.getCustomFields().get('field-a')).to.equal('value-a');
        });

        it('returns the overridden global and the child logger custom fields', function () {
            expect([ ...childLogger.getCustomFields().keys() ]).to.have.members(['field-a', 'field-b']);
            expect(childLogger.getCustomFields().get('field-a')).to.equal('value-override-a');
            expect(childLogger.getCustomFields().get('field-b')).to.equal('value-b');
        });
    });

    describe('Test writing custom fields using JS Maps', function () {
        beforeEach(function () {
            log.setCustomFields(new Map().set('field-a', 'value-a'));
            childLogger = log.createLogger(new Map().set('field-b', 'value-b'));
            childLogger.logMessage('info', 'test-message', new Map().set('field-c', 'value-c'));
        });

        it('writes a log with a global custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value-a');
        });

        it('writes a log with a child logger custom field', function () {
            expect(lastOutput).to.have.property('field-b', 'value-b');
        });

        it('writes a log with a custom field from logMessage call', function () {
            expect(lastOutput).to.have.property('field-c', 'value-c');
        });

        it('returns the global custom field', function () {
            expect([ ...log.getCustomFields().keys() ]).to.have.members(['field-a']);
            expect(log.getCustomFields().get('field-a')).to.equal('value-a');
        });

        it('returns the global and the child logger custom fields', function () {
            expect([ ...childLogger.getCustomFields().keys() ]).to.have.members(['field-a', 'field-b']);
            expect(childLogger.getCustomFields().get('field-a')).to.equal('value-a');
            expect(childLogger.getCustomFields().get('field-b')).to.equal('value-b');
        });
    });

    describe('Test custom field type conversion', function () {
        describe('stringify fields', function () {
            beforeEach(function () {
                log = importFresh("../../../build/main/index");
                log.setCustomFields({ "field-a": 42, "field-b": true, "field-c": { "key": "value" }});
                log.logMessage("info", "test-message");
            });

            it('logs custom fields as strings', function () {
                expect(lastOutput).to.have.property('field-a', '42').that.is.a('string');
                expect(lastOutput).to.have.property('field-b', 'true').that.is.a('string');
                expect(lastOutput).to.have.property('field-c', '{"key":"value"}').that.is.a('string');
            });
        });

        describe('retain field types', function () {
            beforeEach(function () {
                log = importFresh("../../../build/main/index");
                log.setCustomFieldsTypeConversion("retain");
                log.setCustomFields({ "field-a": 42, "field-b": true, "field-c": { "key": "value" }});
                log.logMessage("info", "test-message");
            });

            it('logs custom fields with their retained type', function () {
                expect(lastOutput).to.have.property('field-a', 42).that.is.a('number');
                expect(lastOutput).to.have.property('field-b', true).that.is.a('boolean');
                expect(lastOutput).to.have.property('field-c').that.deep.equals({"key":"value"})
            });
        });
    })

    describe('Test custom field format', function () {
        describe('"cloud-logging" format', function () {
            beforeEach(function () {
                var obj = {
                    "cloud-logs": {}
                }
                process.env.VCAP_SERVICES = JSON.stringify(obj);

                log = importFresh("../../../build/main/index");

                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('logs custom fields with cloud-logging format', function () {
                expect(lastOutput).to.have.property('field-a', 'value');
            });

            it('does not log in application-logging format', function () {
                expect(lastOutput).to.not.have.property('cf');
            });
        });

        describe('"application-logging" format', function () {
            beforeEach(function () {
                log = importFresh("../../../build/main/index");
                log.setCustomFieldsFormat("application-logging");
                log.registerCustomFields(["field-a"]);
                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('logs custom field in application-logging format', function () {
                const expectation = {
                    "#cf": {
                        "string": [{
                            "k": "field-a",
                            "v": "value",
                            "i": 0
                        }]
                    }
                };
                expect(lastOutput).to.deep.contain(expectation);
            });

            it('does not log custom field in cloud-logging format', function () {
                expect(lastOutput).to.not.have.property('field-a', 'value');
            });
        });

        describe('"all" format', function () {
            beforeEach(function () {

                log = importFresh("../../../build/main/index");
                log.setCustomFieldsFormat("all");
                log.registerCustomFields(["field-a"]);
                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('logs custom field in application-logging format', function () {
                const expectation = {
                    "#cf": {
                        "string": [{
                            "k": "field-a",
                            "v": "value",
                            "i": 0
                        }]
                    }
                };
                expect(lastOutput).to.deep.contain(expectation);
            });

            it('logs custom field in cloud-logging format', function () {
                expect(lastOutput).to.have.property('field-a', 'value');
            });
        });

        describe('"disabled" format', function () {
            beforeEach(function () {

                log = importFresh("../../../build/main/index");
                log.setCustomFieldsFormat("disabled");
                log.registerCustomFields(["field-a"]);
                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('does not log custom field in application-logging format', function () {
                expect(lastOutput).to.not.have.property('#cf');
            });

            it('does not log custom field in cloud-logging format', function () {
                expect(lastOutput).to.not.have.property('field-a', 'value');
            });
        });

        describe('"default" format', function () {
            beforeEach(function () {

                log = importFresh("../../../build/main/index");
                log.setCustomFieldsFormat("default");
                log.registerCustomFields(["field-a"]);
                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('does not log custom field in application-logging format', function () {
                expect(lastOutput).to.not.have.property('#cf');
            });

            it('log custom field in cloud-logging format', function () {
                expect(lastOutput).to.have.property('field-a', 'value');
            });
        });
    });
});
