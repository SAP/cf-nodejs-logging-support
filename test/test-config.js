const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
var assert = chai.assert;


chai.should();
describe('Test config', function () {

    var core = null;
    var index = null;
    var httpLogger;
    beforeEach(function () {
        // Set env vars to enable logging of sensitive data
        process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
        process.env.LOG_REMOTE_USER = true;
        process.env.LOG_REFERER = true;

        core = importFresh("../core/log-core.js");
        httpLogger = importFresh("../logger/log-plainhttp.js");
        index = importFresh("../index.js");
        httpLogger.setCoreLogger(core);
        core.setConfig(importFresh("../config.js").config);
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

            httpLogger.logNetwork(req, res, next);
            fireLog();
            fireLog();

            count.should.equal(1);
        });

        it('Test x_forwarded_for', function () {
            req.headers = {};
            req.headers['x-forwarded-for'] = "testingHeader";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("testingHeader");
        });

        it('Test sap_passport', function () {
            var config = index.enableTracing("sap_passport")
            core.setConfig(config);
            req.headers = {};
            req.headers['sap-passport'] = "testingHeader";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.sap_passport.should.equal("testingHeader");
        });

        it('Test sap_passport with array', function () {
            var config = index.enableTracing(["SAP_passport"]);
            core.setConfig(config);
            req.headers = {};
            req.headers['sap-passport'] = "testingHeader";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.sap_passport.should.equal("testingHeader");
        });

        it('Test remote_user', function () {
            req.headers = {};
            req.headers['remote-user'] = "testingName";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_user.should.equal("testingName");
        });

        it('Test connection data propagation', function() {
            req.connection.remoteAddress  = "1.2.3.4";
            req.connection.remotePort = 8080;
            httpLogger.logNetwork(req, res, next);
            fireLog();
            logObject.remote_host.should.equal("1.2.3.4");
            logObject.remote_port.should.equal("8080");
        });
        
        it('Test correlation_id fallback', function () {
            req.headers["x-vcap-request-id"] = "test123";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("test123");
            logObject.correlation_id.should.equal("test123");

        });
        
        
        it('Test HTTP header propagation', function () {
            req.httpVersion = "1.2";
            httpLogger.logNetwork(req, res, next);
            fireLog();
            logObject.protocol.should.equal("HTTP/1.2");

        });

        it('Test default values', function () {
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("-");
            logObject.tenant_id.should.equal("-");
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
});