var chai = require("chai");
var sinon = require("sinon");
var assert = chai.assert;
chai.should();
describe('Test log-express', function () {

    var core = null;
    var expressLogger;
    beforeEach(function () {
        core = null;
        core = require("../cf-nodejs-logging-support-core/log-core.js");
        expressLogger = require("../cf-nodejs-logging-support-express/log-express.js");
        expressLogger.setCoreLogger(core);
    });

    describe('Test linkings', function () {
        var callCounter;
        beforeEach(function () {
            callCounter = 0;
            core.sendLog = function () {
                callCounter++;
            };
            core.setLoggingLevel = function () {
                callCounter++;
            };
            core.initBack = core.initLog;
            core.initLog = function () {
                callCounter++;
                return {};
            };

            core.logMessage = {};
            core.logMessage.apply = function () {
                callCounter++;
            };
        });
        afterEach(function () {

            core.initLog = core.initBack;
        })

        it("Test linking setLoggingLevel", function () {
            expressLogger.setLoggingLevel("test");
            assert.equal(callCounter, 1);
        });

        it("Test linking logMessage", function () {
            expressLogger.logMessage("test");
            assert.equal(callCounter, 1);
        });

        it("Test linking logNetwork", function () {
            var req = {};
            var res = {};
            var fireLog = null;
            res.on = function (tag, func) {
                fireLog = func;
            };
            expressLogger.logNetwork(req, res, function () {});
            fireLog();
            assert.equal(callCounter, 2);
        });
    });

    describe('Test logNetwork', function () {
        var fireLog = null;
        var logObject = null;
        var req = {};
        var res = {};
        var next;

        beforeEach(function () {
            core.sendLog = function (level, logObj) {
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

        describe('Test correlation_id', function () {
            it('Test X-CorrelationID', function () {
                req.header = function (field) {
                    if (field == "X-CorrelationID") {
                        return "correctID";
                    }
                };

                expressLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });

            it('Test x-vcap-request-id', function () {
                req.header = function (field) {
                    if (field == "x-vcap-request-id") {
                        return "correctID";
                    }
                };

                expressLogger.logNetwork(req, res, next);
                fireLog();

                logObject.correlation_id.should.equal("correctID");
            });

            it('Test generated uuid', function () {
                expressLogger.logNetwork(req, res, next);
                fireLog();

                var uuid = logObject.correlation_id;
                console.log("uuid: " + uuid);
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

                expressLogger.logNetwork(req, res, next);
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

            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("correctID");
        });

        it('Test request', function () {
            req.originalUrl = "correctUrl";

            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request.should.equal("correctUrl");
        });

        it('Test response_status', function () {
            res.statusCode = 418;

            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_status.should.equal(418);
        });

        it('Test method', function () {
            req.method = "correctMethod";

            expressLogger.logNetwork(req, res, next);
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
            expressLogger.logNetwork(req, res, next);
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
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.response_size_b.should.equal(4711);
        });

        it('Test remote_host', function () {
            req.connection = {};
            req.connection.remoteAddress = "correctAddress";
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_host.should.equal("correctAddress");
        });

        it('Test remote_port', function () {
            req.connection = {};
            req.connection.remotePort = "correctPort";
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_port.should.equal("correctPort");
        });

        it('Test x_forwarded_for', function () {
            req.headers = {};
            req.headers['x-forwarded-for'] = "testingHeader";
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("testingHeader");
        });

        it('Test remote_ip', function () {
            req.connection.remoteAddress = "correctAddress";
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_ip.should.equal("correctAddress");
        });

        it('Test response_content_type', function () {
            res.get = function (field) {
                if (field == "content-type") {
                    return "text/html;charset=UTF-8";
                }
            };
            expressLogger.logNetwork(req, res, next);
            fireLog();
            logObject.response_content_type.should.equal("text/html;charset=UTF-8");
        });

        it('Test protocol', function () {
            req.httpVersion = 1.1;
            expressLogger.logNetwork(req, res, next);
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
                expressLogger.logNetwork(req, res, next);
                fireLog();
                logObject.request_received_at.should.equal((new Date()).toJSON());
            });

            it('Test response_sent_at', function () {
                expressLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();
                logObject.response_sent_at.should.equal((new Date()).toJSON());
            });

            it('Test response_time', function () {
                expressLogger.logNetwork(req, res, next);
                clock.tick(100);
                fireLog();

                logObject.response_time_ms.should.equal(100);
                expressLogger.logNetwork(req, res, next);
                clock.tick(50);
                fireLog();

                logObject.response_time_ms.should.equal(50);
            });
        });


        it('Test static fields', function () {
            expressLogger.logNetwork(req, res, next);
            fireLog();

            logObject.type.should.equal("request");
            logObject.referer.should.equal("-");
            logObject.remote_user.should.equal("-");
            logObject.direction.should.equal("IN");
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


    describe('Test correlation object', function () {

        var testObject = {
            test: "123"
        }

        beforeEach(function () {
            core.getCorrelationObject = function () {
                return testObject;
            };
        })

        it("Testing getCorrelationObject method propagation", function () {
            expressLogger.getCorrelationObject().test.should.equal(testObject.test);
        });

    });

    describe('Test overrideField', function () {

        var testObject = {};

        before(function () {
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

    describe('Test logMessage', function () {
        var expThat = null;
        var expArg = null;


        beforeEach(function () {
            core.logMessage = {};
            core.logMessage.apply = function (that, arg) {
                expArg = arg;
                expThat = that;
            };
        });

        it("Test arg conservation", function () {
            expressLogger.logMessage("test", "this", {
                "totally": "random"
            });
            expArg[0].should.equal("test");
            expArg[1].should.equal("this");
            assert.property(expArg[2], "totally");
            assert.equal(expArg[2].totally, "random");
            assert.equal(expArg[3], undefined);
        });
    });

    describe('Test setLogPattern', function () {
        var pattern = null;


        beforeEach(function () {
            core.setLogPattern = function (p) {
                pattern = p;
            };
        });

        it("Test pattern conservation", function () {
            expressLogger.setLogPattern("{{hallo}} - {{welt}}");

            pattern.should.equal("{{hallo}} - {{welt}}");

        });
    });
});