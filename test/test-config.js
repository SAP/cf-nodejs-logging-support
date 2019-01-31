const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
var assert = chai.assert;


chai.should();
describe('Test log-express', function () {

    var core = null;
    var expressLogger;
    beforeEach(function () {
        // Set env vars to enable logging of sensitive data
        process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
        process.env.LOG_REMOTE_USER = true;
        process.env.LOG_REFERER = true;

        core = importFresh("../cf-nodejs-logging-support-core/log-core.js");
        expressLogger = importFresh("../cf-nodejs-logging-support-express/log-express.js");
        expressLogger.setCoreLogger(core);
        expressLogger.setConfig(importFresh("../config.js").config);
    });

    describe('Test logNetwork', function () {
        var fireLog = null;
        var logObject = null;
        var req = {};
        var res = {};
        var next;

        beforeEach(function () {
            core.sendLog = function (logObj) {
                logObject = logObj;
            };

            next = function () {};

            req = {};
            req.header = function () {
                return null;
            };

            req.connection = {};
            req.headers = {};


            res = {};
            res.on = function (tag, func) {
                if (tag == 'finish') {
                    fireLog = func;
                }
            };

            res.get = function () {
                return null;
            };
        });

        it('Test anti-duplication mechanism', function () {
            var count = 0;

            core.sendLog = function () {
                count++;
            };

            expressLogger.logNetwork(req, res, next);
            fireLog();
            fireLog();

            count.should.equal(1);
        });

        it('Test x_forwarded_for', function () {
            req.headers = {};
            req.headers['x-forwarded-for'] = "testingHeader";
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("testingHeader");
        });

        it('Test connection data propagation', function() {
            req.connection.remoteAddress  = "1.2.3.4";
            req.connection.remotePort = 8080;
            expressLogger.logNetwork(req, res, next);
            fireLog();
            logObject.remote_host.should.equal("1.2.3.4");
            logObject.remote_port.should.equal("8080");
        });

        
        
        it('Test HTTP header propagation', function () {
            req.httpVersion = "1.2";
            expressLogger.logNetwork(req, res, next);
            fireLog();
            logObject.protocol.should.equal("HTTP/1.2");

        });

        it('Test default values', function () {
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("-");
            logObject.request.should.equal("-");
            logObject.method.should.equal("-");
            logObject.request_size_b.should.equal(-1);
            logObject.remote_host.should.equal("-");
            logObject.response_size_b.should.equal(-1);
            logObject.response_content_type.should.equal("-");
            logObject.remote_port.should.equal("-");
            logObject.x_forwarded_for.should.equal("");
            logObject.protocol.should.equal("HTTP");
            logObject.response_content_type.should.equal("-");

        });


    });

    describe('Test overrideField', function () {

        var testObject = {};

        beforeEach(function () {
            core.overrideField = function (field, value) {
                testObject[field] = value;
                return true;
            };
        })

        it("Testing overrideField method propagation", function () {
            assert.isTrue(expressLogger.overrideField("msg", "test"));
            testObject["msg"].should.equal("test");
        });

    });

    describe('Test setLoggingLevel', function () {
        var level = null;

        beforeEach(function () {
            core.setLoggingLevel = function (lvl) {
                level = lvl;
            };
        });

        it("Test Logging level", function () {
            expressLogger.setLoggingLevel("error");
            level.should.equal("error");
            expressLogger.setLoggingLevel("log");
            level.should.equal("log");
            expressLogger.setLoggingLevel("test");
            level.should.equal("test");
        });
    });
});