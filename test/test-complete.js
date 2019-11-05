const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
var httpMock = require("node-mocks-http");
var assert = chai.assert;

chai.should();

Function.prototype.override = function (func) {
    var superFunction = this;
    return function () {
        this.superFunction = superFunction;
        return func.apply(this, arguments);
    };
};

describe('Test Complete', function () {
    var store;

    // Set env vars to enable logging of sensitive data
    process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
    process.env.LOG_REMOTE_USER = true;
    process.env.LOG_REFERER = true;

    process.env.VCAP_APPLICATION = JSON.stringify({
        application_id: "test-app-id",
        application_name: "test-app-name",
        instance_index: "7",
        organization_id: "test-org-id",
        organization_name: "test-org-name",
        space_id: "test-space-id",
        space_name: "test-space-name"
    });

    var log = importFresh("../index");
    var results = require("./exp-results");

    var prepare = function (res) {
        res.names = [];
        self = res;
        res.on = function (name, func) {
            self.names[name] = func;
        }
        res.emit = function (name) {
            if (self.names[name]) {
                self.names[name]();
            }
        }
    }

    var origStdout = process.stdout.write;
    process.stdout.write = process.stdout.write.override(
        function (obj) {
            store = obj;
            this.superFunction(obj);
        }
    );
    before(function () {
        clock = sinon.useFakeTimers();
    });

    after(function () {
        clock.restore();
        process.stdout.write = origStdout;
    });

    it("checking dummy app results", () => {
        process.hrtime = function () {
            return [12, 14];
        }
        req = httpMock.createRequest({
            headers: {
                "X-CorrelationID": "test-correlation-id",
                "remote-user": "test-user"
            }
        });
        res = httpMock.createResponse();
        prepare(res);
        log.overrideNetworkField("msg","testmessage");
        log.logNetwork(req, res, () => {});
        res.end("ok");
        assert.deepEqual(JSON.parse(store),results.getLogMessage());
    });
});