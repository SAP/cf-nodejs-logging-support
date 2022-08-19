const { expect } = require('chai');
const importFresh = require('import-fresh');
var httpMocks = require('node-mocks-http');
process.env.VCAP_SERVICES = "CF";
process.env.VCAP_APPLICATION = JSON.stringify(
    {
        "cf_api": "test-value",
        "limits": {
            "fds": 32768
        },
        "application_name": "test-value",
        "application_uris": [
            "test-value"
        ],
        "name": "test-value",
        "space_name": "test-value",
        "space_id": "test-value",
        "organization_id": "test-value",
        "organization_name": "test-value",
        "uris": [
            "test-value"
        ],
        "users": null,
        "application_id": "test-value8"
    }
);

function toMatchStructure(obj1, obj2) {
    return Object.keys(obj1).every(key => {
        const v = obj1[key];

        if (typeof v === 'object' && v !== null) {
            return toMatchStructure(v, obj2[key]);
        }

        return obj2.hasOwnProperty(key);
    });
}

var lastLevel;
var lastOutputOldLib;
var logCount;

describe('Test performance of old and new library', function () {

    beforeEach(function () {

        oldLog = importFresh("../../../../index");
        newLog = importFresh("../../build/main/index");

        logCount = 0;
        lastLevel = "";
        lastOutputOldLib = "";
        lastOutputNewLib = "";

        newLog.setSinkFunction(function (level, output) {
            lastLevel = level;
            lastOutputNewLib = output;
            logCount++;
        });

        oldLog.setSinkFunction(function (level, output) {
            lastLevel = level;
            lastOutputOldLib = output;
            logCount++;
        });
    });

    describe('Confirm old and new library logs the same', function () {

        it('Compare msg logs of old and new library', function () {
            oldLog.logMessage("info", "test-message");
            newLog.logMessage("info", "test-message");

            console.log(lastOutputNewLib);
            console.log(lastOutputOldLib);
            // check all keys in new lib log are also logged in old lib log
            expect(toMatchStructure(lastOutputNewLib, lastOutputOldLib)).to.be.true;
        });
    });

    describe('Logs 1 log, 1 cached log and compare', function () {
        beforeEach(function () {
            newLog.logMessage("info", "test-message");
            firstLog = lastOutputNewLib;
            newLog.logMessage("info", "test-message");
            secondLog = lastOutputNewLib;

            // ignore time fields
            firstLog = JSON.parse(firstLog);
            secondLog = JSON.parse(secondLog);
            firstLog.written_ts = "123";
            firstLog.written_at = "123";
            firstLog.request_received_at = "123";
            firstLog.response_sent_at = "123";
            secondLog.written_ts = "123";
            secondLog.written_at = "123";
            secondLog.request_received_at = "123";
            secondLog.response_sent_at = "123";


        });

        it('first log equals second cached log', function () {
            expect(firstLog).to.be.eql(secondLog);
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

    describe.skip('logNetwork', function () {

        // to do: assert that output of old and new library are equal

        it('Old library', function () {

            var req = httpMocks.createRequest({ method: 'GET', url: 'globalcontext' });
            // req.headers["referer"] = "test-referer";
            // req.user = {
            //     id: "test-user"
            // };
            // req.connection = {
            //     remoteAddress: "test-user",
            //     remotePort: "remote-port"
            // };
            var res = httpMocks.createResponse();


            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                oldLog.logNetwork(req, res, () => { });
            }

            var endTime = performance.now()

            console.log(`Old lib: logNetwork ${endTime - startTime} milliseconds`)
            console.log("Old lib:" + lastOutputOldLib);
        });

        it('New library', function () {

            var req = httpMocks.createRequest({ method: 'GET', url: 'globalcontext' });

            // dont override req object
            // req.headers["referer"] = "test-referer";
            // req.headers["x-vcap-request-id"] = "1234";
            // req.headers["x-correlationid"] = "1234";
            // req.headers["tenantid"] = "1234";
            // req.user = {
            //     id: "test-user"
            // };
            // req.connection = {
            //     remoteAddress: "test-user",
            //     remotePort: "remote-port"
            // };

            var res = httpMocks.createResponse();

            var startTime = performance.now()

            for (let index = 0; index < 10000; index++) {
                newLog.logNetwork(req, res, () => { });
            }

            var endTime = performance.now()

            // var startTime2 = performance.now()

            // for (let index = 0; index < 10000; index++) {
            //     newLogWithDefaults.logMessage("info", "test-message");
            // }

            // var endTime2 = performance.now()

            console.log(`New lib: logNetwork ${endTime - startTime} milliseconds`)
            console.log("New lib:" + lastOutputNewLib);
            // console.log(`New lib with defaults: Logging 10.000 simple messages took ${endTime2 - startTime2} milliseconds`)

        });
    });

    describe.skip('Compare buildMsgRecord and writeLog performance', function () {

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10; index++) {
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()



            console.log(`New lib: Logging 10 simple messages took ${endTime - startTime} milliseconds`)

        });
    });

    describe.skip('Check performance for creating Config instance', function () {

        it('New library', function () {

            var startTime = performance.now()

            for (let index = 0; index < 10; index++) {
                newLog.logMessage("info", "test-message");
            }

            var endTime = performance.now()

            console.log(`New lib: Logging 10 simple messages took ${endTime - startTime} milliseconds`)
        });
    });
});
