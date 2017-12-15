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

    var log = require("../index");
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
                "X-CorrelationID": "uuid-Dummy"
            }
        });
        res = httpMock.createResponse();
        prepare(res);
        log.overrideNetworkField("msg","testmessage");
        log.logNetwork(req, res, () => {});
        res.end("ok");
        store.should.equal(results.getLogMessage());
    });
});