const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
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

        core = importFresh("../core/log-core.js");
        httpLogger = importFresh("../logger/log-plainhttp");
        httpLogger.setCoreLogger(core);
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

            req.connection = {};
            req.headers = {};
            req.getHeader = function (header) {
                header = header.toLocaleLowerCase();
                return this.headers[header];
            }


            res = {};
            res.on = function (tag, func) {
                if (tag == 'finish') {
                    fireLog = func;
                }
            };

            res._headers = {};
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

        describe('Test correlation_id', function () {
            it('Test X-CorrelationID', function () {
                req.headers["x-correlationid"] = "correctID";

                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });

            it('Test generated uuid', function () {
                httpLogger.logNetwork(req, res, next);
                fireLog();

                var uuid = logObject.correlation_id;
                var pattern = new RegExp("[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?4[0-9a-fA-F]{3}-?[89abAB][0-9a-fA-F]{3}-?[0-9a-fA-F]{12}");

                pattern.test(uuid).should.equals(true);
            });

            it('Test X-CorrelationID vs x-vcap-request-id', function () {
                req.headers["x-correlationid"] = "correctID";
                req.headers["x-vcap-request-id"] = "wrongID";

                httpLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });
        });

        it('Test request_id', function () {
            req.headers["x-vcap-request-id"] = "correctID";

            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("correctID");
        });

        it('Test tenant_id', function () {
            req.headers["tenantid"] = "correctID";

            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.tenant_id.should.equal("correctID");
        });


        it('Test request', function () {
            req.url = "correctUrl";

            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request.should.equal("correctUrl");
        });

        it('Test response_status', function () {
            res.statusCode = 418;

            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_status.should.equal(418);
        });

        it('Test method', function () {
            req.method = "correctMethod";

            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.method.should.equal("correctMethod");
        });

        it('Test request_size_b', function () {
            req.headers["content-length"] = 4711;
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_size_b.should.equal(4711);
        });

        it('Test response_size_b', function () {
            res.getHeader = function (field) {
                if (field == "content-length") {
                    return 4711;
                }
                return null;
            };
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_size_b.should.equal(4711);
        });

        it('Test remote_host', function () {
            req.connection = {};
            req.connection.remoteAddress = "correctAddress";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_host.should.equal("correctAddress");
        });

        it('Test remote_port', function () {
            req.connection = {};
            req.connection.remotePort = "correctPort";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_port.should.equal("correctPort");
        });

        it('Test x_forwarded_for', function () {
            req.headers['x-forwarded-for'] = "testingHeader";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("testingHeader");
        });

        it('Test referer', function () {
            req.headers['referer'] = "testingReferer";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.referer.should.equal("testingReferer");
        });


        it('Test remote_ip', function () {
            req.connection.remoteAddress = "correctAddress";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_ip.should.equal("correctAddress");
        });

        it('Test response_content_type', function () {
            res.getHeader = function (field) {
                if (field == "content-type") {
                    return "text/html;charset=UTF-8";
                }
            };
            httpLogger.logNetwork(req, res, next);
            fireLog();
            logObject.response_content_type.should.equal("text/html;charset=UTF-8");
        });

        it('Test protocol', function () {
            req.httpVersion = 1.1;
            httpLogger.logNetwork(req, res, next);
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
                httpLogger.logNetwork(req, res, next);
                fireLog();
                logObject.request_received_at.should.equal((new Date()).toJSON());
            });

            it('Test response_sent_at', function () {
                httpLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();
                logObject.response_sent_at.should.equal((new Date()).toJSON());
            });

            it('Test response_time', function () {
                httpLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();

                logObject.response_time_ms.should.equal(100);
            });
        });


        it('Test static fields', function () {
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.type.should.equal("request");
            logObject.referer.should.equal("-");
            logObject.remote_user.should.equal("-");
            logObject.direction.should.equal("IN");
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

        it("Test log ommitting per loging Level", function () {
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
