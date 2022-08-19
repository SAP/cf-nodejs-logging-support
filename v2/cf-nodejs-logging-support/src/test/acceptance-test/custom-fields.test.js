var expect = require('chai').expect;
const importFresh = require('import-fresh');

var log;
var lastOutput;

describe('Test custom fields', function () {

    beforeEach(function () {
        log = importFresh("../../../build/main/index");

        lastOutput = "";

        log.setSinkFunction(function (level, output) {
            lastOutput = JSON.parse(output);
        });
    });


    describe('Writes log with a global custom field ', function () {
        beforeEach(function () {
            log.setCustomFields({ "field-a": "value" });
            log.logMessage("info", "test-message");
        });

        it('writes a log with a custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value');
        });
    });

    describe('Write log with a child custom field ', function () {
        beforeEach(function () {
            log.setCustomFields({ "field-a": "value" });
            log.logMessage("info", "test-message");
        });

        it('writes a log with a custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value');
        });
    });

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
