const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
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

        core = importFresh("../core/log-core.js");
        restifyLogger = importFresh("../logger/log-restify.js");
        restifyLogger.setCoreLogger(core);
        core.setConfig(importFresh("./allbranchconfig.js").config);
    });



    describe('Test linkings', function () {
        var countSendLog;
        var countInitLog;

        beforeEach(function () {
            countSendLog = 0;
            countInitLog = 0;

            core.sendLog = function () {
                countSendLog++;
            };

            core.initBack = core.initLog;
            core.initLog = function () {
                countInitLog++;
                return {};
            };
        });

        afterEach(function () {
            core.initLog = core.initBack;
        });

        it("Test linking logNetwork", function () {
            var req = {};
            var res = {};
            var fireLog = null;
            res.on = function (tag, func) {
                fireLog = func;
            };
            restifyLogger.logNetwork(req, res, function () {});
            fireLog();
            assert.equal(countInitLog, 1);
            assert.equal(countSendLog, 1);
        });
    });

    describe('Test logNetwork', function () {
        var fireLog = null;
        var logObject = null;
        var req = {};
        var res = {};
        var next;

        beforeEach(function () {
            logObject = null;
            core.sendLog = function (logObj) {
                logObject = logObj;
            };

            next = function () { };

            req = {};
            req.header = function () {
                return null;
            };

            req.connection = {};
            req.headers = {};


            res = {};
            res.on = function (tag, func) {
                fireLog = func;
            };

            res.get = function () {
                return null;
            };
        });

        describe('Test correlation_id', function () {
            it('Test X-CorrelationID', function () {
                req.header = function (field) {
                    if (field == "X-CorrelationID") {
                        return "correctID";
                    }
                };

                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });

            it('Test generated uuid', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();

                var uuid = logObject.correlation_id;
                var pattern = new RegExp("[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?4[0-9a-fA-F]{3}-?[89abAB][0-9a-fA-F]{3}-?[0-9a-fA-F]{12}");

                pattern.test(uuid).should.equals(true);
            });

            it('Test X-CorrelationID vs x-vcap-request-id', function () {
                req.header = function (field) {
                    if (field == "X-CorrelationID") {
                        return "correctID";
                    }
                    if (field == "x-vcap-request-id") {
                        return "wrongID";
                    }
                };

                restifyLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });
        });

        it('Test request_id', function () {
            req.header = function (field) {
                if (field == "x-vcap-request-id") {
                    return "correctID";
                }
            };

            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("correctID");
        });

        it('Test tenant_id', function () {
            req.header = function (field) {
                if (field == "tenantid") {
                    return "correctID";
                }
            };

            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.tenant_id.should.equal("correctID");
        });


        it('Test request', function () {
            req.url = "correctUrl";

            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request.should.equal("correctUrl");
        });

        it('Test response_status', function () {
            res.statusCode = 418;

            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_status.should.equal(418);
        });

        it('Test method', function () {
            req.method = "correctMethod";

            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.method.should.equal("correctMethod");
        });

        it('Test request_size_b', function () {
            req.header = function (field) {
                if (field == "content-length") {
                    return 4711;
                }
                return null;
            };
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_size_b.should.equal(4711);
        });

        it('Test response_size_b', function () {
            res.get = function (field) {
                if (field == "content-length") {
                    return 4711;
                }
                return null;
            };
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_size_b.should.equal(4711);
        });

        it('Test remote_host', function () {
            req.connection = {};
            req.connection.remoteAddress = "correctAddress";
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_host.should.equal("correctAddress");
        });

        it('Test remote_port', function () {
            req.connection = {};
            req.connection.remotePort = "correctPort";
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_port.should.equal("correctPort");
        });

        it('Test x_forwarded_for', function () {
            req.headers = {};
            req.headers['x-forwarded-for'] = "testingHeader";
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("testingHeader");
        });

        it('Test remote_ip', function () {
            req.connection.remoteAddress = "correctAddress";
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_ip.should.equal("correctAddress");
        });

        it('Test response_content_type', function () {
            res.get = function (field) {
                if (field == "content-type") {
                    return "text/html;charset=UTF-8";
                }
            };
            restifyLogger.logNetwork(req, res, next);
            fireLog();
            logObject.response_content_type.should.equal("text/html;charset=UTF-8");
        });

        it('Test protocol', function () {
            req.httpVersion = 1.1;
            restifyLogger.logNetwork(req, res, next);
            fireLog();
            logObject.protocol.should.equal("HTTP/1.1");
        });

        describe('Test timings', function () {
            var clock;
            before(function () {
                clock = sinon.useFakeTimers();
            });
            after(function () {
                clock.restore();
            });
            it('Test received_at', function () {
                restifyLogger.logNetwork(req, res, next);
                fireLog();
                logObject.request_received_at.should.equal((new Date()).toJSON());
            });


            it('Test response_sent_at', function () {
                restifyLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();
                logObject.response_sent_at.should.equal((new Date()).toJSON());
            });

            it('Test response_time', function () {
                restifyLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();

                logObject.response_time_ms.should.equal(100);
                restifyLogger.logNetwork(req, res, next);
                clock.tick(50);
                fireLog();

                logObject.response_time_ms.should.equal(50);
            });
        });


        it('Test static fields', function () {
            restifyLogger.logNetwork(req, res, next);
            fireLog();

            logObject.type.should.equal("request");
            logObject.referer.should.equal("-");
            logObject.remote_user.should.equal("-");
            logObject.direction.should.equal("IN");
        });

        it('Test default values', function () {
            restifyLogger.logNetwork(req, res, next);
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

        it("Test log ommitting per loging Level", function () {
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