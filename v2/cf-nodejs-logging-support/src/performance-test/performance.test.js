cfConfig = require('./config-cf-with-defaults.json');
requestConfig = require('./config-request-with-defaults.json');
const importFresh = require('import-fresh');
process.env.VCAP_SERVICES = "CF";
process.env.VCAP_APPLICATION = JSON.stringify(
    {
        "cf_api": "https://api.cf.stagingaws.hanavlab.ondemand.com",
        "limits": {
            "fds": 32768
        },
        "application_name": "I556334-express-cf-logging-support-sample",
        "application_uris": [
            "I556334-express-cf-logging-support-sample.cert.cfapps.stagingaws.hanavlab.ondemand.com"
        ],
        "name": "I556334-express-cf-logging-support-sample",
        "space_name": "dev",
        "space_id": "9c58830f-ed14-4ac3-a0b2-d7957c4a23ae",
        "organization_id": "0a2f41af-a1d3-45d4-81bc-247d1f8ea2fc",
        "organization_name": "Cloud-Logging_Perfx-CLS",
        "uris": [
            "I556334-express-cf-logging-support-sample.cert.cfapps.stagingaws.hanavlab.ondemand.com"
        ],
        "users": null,
        "application_id": "87a4594e-c93e-42c5-87f6-15d92985e6a8"
    }
);
var log;
var lastLevel;
var lastOutput;
var logCount;

describe('Test performance of old and new library', function () {

    beforeEach(function () {

        oldLog = importFresh("../../../../index");
        newLog = importFresh("../../build/main/index");
        newLogWithDefaults = importFresh("../../build/main/index");
        newLogWithDefaults.addConfig(cfConfig, requestConfig);

        logCount = 0;
        lastLevel = "";
        lastOutput = "";

        newLog.setSinkFunction(function (level, output) {
            lastLevel = level;
            lastOutput = output;
            logCount++;
        });

        oldLog.setSinkFunction(function (level, output) {
            lastLevel = level;
            lastOutput = output;
            logCount++;
        });
    });

    describe('Write 10.000 logs with a simple message', function () {

        it('Old library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                oldLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()


            console.log(`Old lib: Logging 10.000 simple messages took ${endTime - startTime} milliseconds`)
        });

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            var startTime2 = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLogWithDefaults.logMessage("info", "test-message");
            }

            var endTime2 = performance.now()

            console.log(`New lib: Logging 10.000 simple messages took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)

        });
    });

    describe('Write 10.000 logs with a global custom field', function () {

        it('Old library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                oldLog.setCustomFields({ "field-a": "value" });
                oldLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            console.log(`Old lib: Logging 10.000 messages with global custom field took ${endTime - startTime} milliseconds`)
        });

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLog.setCustomFields({ "field-a": "value" });
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            var startTime2 = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLogWithDefaults.logMessage("info", "test-message");
            }

            var endTime2 = performance.now()

            console.log(`New lib: Logging 10.000 messages with global custom field took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)

        });
    });

    describe('Child logger: Write 10.000 logs with a simple message', function () {

        it('Old library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                var childLogger = oldLog.createLogger({ "child-field": "value" });
                childLogger.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            console.log(`Old lib: Logging a simple message from a new child logger 10.000 times took ${endTime - startTime} milliseconds`)
        });

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                var childLogger = newLog.createLogger({ "child-field": "value" });
                childLogger.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            var startTime2 = performance.now()

            for (let index = 0; index < 10000; index++) {
                var childLogger = newLogWithDefaults.createLogger({ "child-field": "value" });
                childLogger.logMessage("info", "test-message");
            }

            var endTime2 = performance.now()

            console.log(`New lib: Logging a simple message from a new child logger 10.000 times took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)
        });
    });


    describe('Write 10.000 logs with a global custom field', function () {

        it('Old library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                oldLog.setLoggingLevel('debug');
                oldLog.logMessage("debug", "test-message");
            }

            var endTime = performance.now()

            console.log(`Old lib: Setting a new logging level and loging a message 10.000 times took ${endTime - startTime} milliseconds`)
        });

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLog.setLoggingLevel('debug');
                newLog.logMessage("debug", "test-message");
            }

            var endTime = performance.now()

            var startTime2 = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLogWithDefaults.logMessage("info", "test-message");
            }

            var endTime2 = performance.now()

            console.log(`New lib: Setting a new logging level and loging a message 10.000 times took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)
        });
    });

    describe.skip('Compare buildMsgRecord and writeLog performance', function () {

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10; index++) {
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            var startTime2 = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLogWithDefaults.logMessage("info", "test-message");
            }

            var endTime2 = performance.now()

            console.log(`New lib: Logging 10 simple messages took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)

        });
    });

    describe.skip('Check performance for creating Config instance', function () {

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10; index++) {
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            var startTime = performance.now()

            for (let index = 0; index < 10; index++) {
                newLogWithDefaults.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            console.log(`New lib: Logging 10 simple messages took ${endTime - startTime} milliseconds`)
            console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)
        });
    });
});
