var expect = require('chai').expect;
const importFresh = require('import-fresh');

var log;
var lastOutput;

describe.skip('Test custom fields', function () {

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
            log.info("test-message");
        });

        it('writes a log with a custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value');
        });
    });

    describe('Write log with a child custom field ', function () {
        beforeEach(function () {
            log.setCustomFields({ "field-a": "value" });
            log.info("test-message");
        });

        it('writes a log with a custom field', function () {
            expect(lastOutput).to.have.property('field-a', 'value');
        });
    });

    describe('Test custom field format', function () {

        describe('cloud-logging format', function () {

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

            afterEach(function () {
                delete process.env.VCAP_SERVICES;
            });
        });

        describe('application-logging format', function () {
            beforeEach(function () {

                var obj = {
                    "application-logs": {}
                }
                process.env.VCAP_SERVICES = JSON.stringify(obj);

                log = importFresh("../../../build/main/index");
                log.registerCustomFields(["field-a"]);
                log.setCustomFields({ "field-a": "value" });
                log.logMessage("info", "test-message");
            });

            it('logs with application-logging format', function () {
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

            afterEach(function () {
                delete process.env.VCAP_SERVICES;
            });
        });
    });
});
