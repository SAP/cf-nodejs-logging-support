const importFresh = require('import-fresh');
var chai = require("chai");
var assert = chai.assert;


chai.should();
describe('Test log-plainhttp', function () {

    var core = null;
    var httpLogger;
    beforeEach(function () {
        // Set env vars to enable logging of sensitive data
        process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
        process.env.LOG_REMOTE_USER = true;
        process.env.LOG_REFERER = true;
        process.env.LOG_SSL_HEADERS = true;

        core = importFresh("../core/log-core.js");
        httpLogger = importFresh("../logger/log-plainhttp.js");
        httpLogger.setCoreLogger(core);
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
            httpLogger.logNetwork(req, res, function () {});
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
                getHeader: function (header) {
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
                getHeader: function (header) {
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
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.level.should.equal("warn");
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

        describe('Test field handling', function () {

            it('Test "static" field', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_static.should.equal("test-value-static");
            });

            it('Test "header" field (req)', function () {
                reqHeaders = [];
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_header_req.should.equal("test-header-req");
                reqHeaders.should.include("test-header-req");
            });

            it('Test "header" field (res)', function () {
                reqHeaders = [];
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_header_res.should.equal("test-header-res");
                resHeaders.should.include("test-header-res");
            });

            it('Test "self" field (req)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_self_req.should.equal("test-header-req");
            });

            it('Test "self" field (res)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_self_res.should.equal("test-header-res");
            });

            it('Test "field" field (req)', function () {
                req["test-field"] = "test-value-field-req";
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_field_req.should.equal("test-value-field-req");
            });

            it('Test "field" field (res)', function () {
                res["test-field"] = "test-value-field-res";
                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.test_field_res.should.equal("test-value-field-res");
            });

            it('Test "time" field (req+res)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_time.should.equal(3);
            });

            it('Test "special" field (req)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_special_req.should.equal("test-value-special-req");  
            });

            it('Test "special" field (res)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_special_res.should.equal("test-value-special-res");  
            });


            it('Test defaults (req)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_defaults_req.should.equal("test-default-req");  
            });

            it('Test defaults (res)', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.test_defaults_res.should.equal("test-default-res");  
            });
        });

        it("Test log omitting per logging Level", function () {
            core.setLoggingLevel("error");
            httpLogger.logNetwork(req, res, next);
            fireLog();
            assert.isNull(logObject);
            core.setLoggingLevel("info");
            httpLogger.logNetwork(req, res, next);
            fireLog();
            assert.isNotNull(logObject);
        });
    });
});