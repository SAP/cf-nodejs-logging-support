const importFresh = require('import-fresh');
var chai = require("chai");
var assert = chai.assert;


chai.should();
describe('Test log-restify', function () {

    var core = null;
    var restifyLogger;
    beforeEach(function () {
        // Set env vars to enable logging of sensitive data
        process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
        process.env.LOG_REMOTE_USER = true;
        process.env.LOG_REFERER = true;
        process.env.LOG_SSL_HEADERS = true;

        core = importFresh("../core/log-core.js");
        restifyLogger = importFresh("../logger/log-restify.js");
        restifyLogger.setCoreLogger(core);
        core.setConfig(importFresh("./allbranchconfig.js").config);
    });

    describe('Test binding', function () {
        var countSendLog;
        var countInitRequestLog;

        beforeEach(function () {
            countSendLog = 0;
            countInitRequestLog = 0;

            core.sendLog = function () {
                countSendLog++;
            };

            core.initRequestLog = function () {
                countInitRequestLog++;
                var obj = {};
                obj.level = "info";
                return obj;
            };
        });

        afterEach(function () {
            core.initRequestLog = core.initRequestLog;
        })

        it("Test linking logNetwork", function () {
            var req = {};
            var res = {};
            var fireLog = null;
            res.on = function (tag, func) {
                fireLog = func;
            };
            restifyLogger.logNetwork(req, res, function () {});
            fireLog();
            assert.equal(countInitRequestLog, 1);
            assert.equal(countSendLog, 1);
        });
    });

    describe('Test logNetwork', function () {
        var fireLog = null;
        var logObject = null;
        var req = {};
        var res = {};
        var reqHeaders = [];
        var resHeaders = [];
        var next;

        beforeEach(function () {
            logObject = null;
            core.sendLog = function (logObj) {
                logObject = logObj;
            };

            next = function () {};

            req = {
                connection: {},
                headers: {},
                header: function (header) {
                    if (header == null) return;
                    reqHeaders.push(header)
                    return "test-header-req"
                }
            };

            res = {
                headers: {},
                on: function (tag, func) {
                    if (tag == 'finish') {
                        fireLog = func;
                    }
                },    
                get: function (header) {
                    if (header == null) return;
                    resHeaders.push(header)
                    return "test-header-res"
                }
            };

            reqHeaders = [];
            resHeaders = [];
        });

        it('Test request log level changing', function () {
            core.setRequestLogLevel("warn")    
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.level.should.equal("warn");
        });

        describe('Test field handling', function () {

            it('Test "static" field', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_static.should.equal("test-value-static");
            });

            it('Test "header" field (req)', function () {
                reqHeaders = [];
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_header_req.should.equal("test-header-req");
                reqHeaders.should.include("test-header-req");
            });

            it('Test "header" field (res)', function () {
                reqHeaders = [];
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_header_res.should.equal("test-header-res");
                resHeaders.should.include("test-header-res");
            });

            it('Test "self" field (req)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_self_req.should.equal("test-header-req");
            });

            it('Test "self" field (res)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_self_res.should.equal("test-header-res");
            });

            it('Test "field" field (req)', function () {
                req["test-field"] = "test-value-field-req";
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_field_req.should.equal("test-value-field-req");
            });

            it('Test "field" field (res)', function () {
                res["test-field"] = "test-value-field-res";
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_field_res.should.equal("test-value-field-res");
            });

            it('Test "time" field (req+res)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_time.should.equal(3);
            });

            it('Test "special" field (req)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_special_req.should.equal("test-value-special-req");  
            });

            it('Test "special" field (res)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_special_res.should.equal("test-value-special-res");  
            });


            it('Test defaults (req)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_defaults_req.should.equal("test-default-req");  
            });

            it('Test defaults (res)', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_defaults_res.should.equal("test-default-res");  
            });
        });

        it("Test log omitting per logging Level", function () {
            core.setLoggingLevel("error");
            restifyLogger.logNetwork(req, res, next);
            fireLog();
            assert.isNull(logObject);
            core.setLoggingLevel("info");
            restifyLogger.logNetwork(req, res, next);
            fireLog();
            assert.isNotNull(logObject);
        });
    });
});