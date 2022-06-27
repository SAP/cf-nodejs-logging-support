const importFresh = require('import-fresh');

var log;
var lastLevel;
var lastOutput;
var logCount;

describe('Test performance of old and new library', function () {

    beforeEach(function () {
        oldLog = importFresh("../../../../../index");
        newLog = importFresh("../../../build/main/index");

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

            console.log(`New lib: Logging 10.000 simple messages took ${endTime - startTime} milliseconds`)
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

            console.log(`New lib: Logging 10.000 messages with global custom field took ${endTime - startTime} milliseconds`)
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

            console.log(`New lib: Logging a simple message from a new child logger 10.000 times took ${endTime - startTime} milliseconds`)
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

            console.log(`New lib: Setting a new logging level and loging a message 10.000 times took ${endTime - startTime} milliseconds`)
        });
    });

});
