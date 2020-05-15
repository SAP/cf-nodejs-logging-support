"use strict"
const importFresh = require('import-fresh');
var chai = require("chai");
var assert = chai.assert;
chai.should();
var os = require("os");
var sinon = require("sinon");
var rewire = require("rewire");
var jwt = require('jsonwebtoken');
var fs = require('fs');

describe('Test log-core', function () {
    describe('Test init function', function () {
        var defHeader, envAdress;
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        before(function () {
            defHeader = core.__get__("DEFAULT_DYN_LOG_LEVEL_HEADER");
            envAdress = core.__get__("ENV_DYN_LOG_HEADER");
        });

        it('Test correct reading from process.env', function () {
            core.init();
            core.__get__("dynLogLevelHeader").should.equal(defHeader);
            process.env[envAdress] = "test";
            core.init();
            core.__get__("dynLogLevelHeader").should.equal("test");
        });
    });

    describe('Test reduceFields', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var testConfig = [
            {
                name: "test-field-a",
                core: true,
                reduce: true,
                source: {
                    type: "static",
                    value: "42"
                }
            }, {
                name: "test-field-b",
                core: false,
                source: {
                    type: "static",
                    value: "test"
                }
            }, {
                name: "test-field-c",
                core: false,
                reduce: true,
                source: {
                    type: "static",
                    value: "test"
                },
                default: "def"
            }
        ];
        var logObj
        var reduceFields;
        before(function () {
            reduceFields = core.__get__("reduceFields");
        });

        beforeEach(function () {
            logObj = {
                "test-field-a": 42,
                "test-field-b": "test",
                "test-field-c": "def"
            };
        })

        it('Test correct handling of cases: ', function () {
            reduceFields(testConfig, logObj);
            logObj["test-field-a"].should.not.equal(42);
            logObj["test-field-b"].should.equal("test");
            logObj["test-field-c"].should.equal("def");

        });
    });

    describe('Test prepareInitDummy', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logObj;
        var prepareDummy;
        before(function () {
            prepareDummy = core.__get__("prepareInitDummy");
        });

        it('Test fallbacks:', function () {

            var testConfig = [
                {
                    name: "test-field-a",
                    core: true,
                    source: {
                        type: "static",
                        value: 42
                    }
                }, {
                    name: "test-field-b",
                    core: true,
                    mandatory: true,
                    source: {
                        type: "sth"
                    },
                    fallback: function (obj) {
                        return obj["test-field-a"] * 2;
                    }
                }

            ]

            var expected = {
                "test-field-a": 42,
                "test-field-b": 84
            };

            var res = prepareDummy(testConfig);
            assert.equal(res["test-field-a"], expected["test-field-a"]);
            assert.equal(res["test-field-b"], expected["test-field-b"]);
        });

        it('Test nested-env:', function () {

            process.env.FIELD = JSON.stringify({
                c: "test-value"
            });

            var testConfig = [
                {
                    name: "test-field-c",
                    core: true,
                    source: {
                        type: "nested-env",
                        path: ["FIELD", "c"]
                    }
                }, {
                    name: "test-field-d",
                    core: true,
                    mandatory: true,
                    source: {
                        type: "nested-env",
                        path: []
                    },
                    default: "-"
                }
            ];

            var expected = {
                "test-field-c": "test-value",
                "test-field-d": "-"
            };

            var res = prepareDummy(testConfig);
            assert.equal(res["test-field-c"], expected["test-field-c"]);
            assert.equal(res["test-field-d"], expected["test-field-d"]);

            process.env.FIELD = undefined;
        });
    });

    describe('Test setConfig assignments', function () {
        var core = null;
        var testConfig = [
            {
                name: "test-field-a",
                core: true,
                source: {
                    type: "static",
                    value: "42"
                }
            }, {
                name: "test-field-b",
                core: false,
                source: {
                    type: "self",
                    name: "other-field"
                }
            }, {
                name: "test-field-c",
                core: false,
                source: {
                    type: "time"
                }
            }, {
                name: "test-field-d",
                core: false,
                source: {
                    type: "field",
                    parent: "res"
                }
            }

        ]

        beforeEach(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        });

        it('Test config assignment (core): ', function () {

            core.__set__({
                "prepareInitDummy": function (config) {
                    config.length.should.equal(1);
                    config[0].should.equal(testConfig[0]);
                }
            })

            core.setConfig(testConfig);
        });

        it('Test config assignment (pre): ', function () {
            core.setConfig(testConfig);

            var config = core.getPreLogConfig();
            config.length.should.equal(2);
            config[0].should.equal(testConfig[1]);
            config[1].should.equal(testConfig[2]);
        });

        it('Test config assignment (post): ', function () {
            core.setConfig(testConfig);

            var config = core.getPostLogConfig();
            config.length.should.equal(1);
            config[0].should.equal(testConfig[3]);
        });
    });

    describe('Test reduceFields assignments', function () {
        var core = null;
        var testConfig = [
            {
                name: "test-field-a",
                core: true,
                reduce: true,
                source: {
                    type: "static",
                    value: "42"
                }
            },
            {
                name: "test-field-b",
                core: true,
                source: {
                    type: "static",
                    value: "42"
                }
            }
        ]

        beforeEach(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        });

        it('Test config assignment (core): ', function () {

            core.__set__({
                "prepareInitDummy": function (config) {
                    config.length.should.equal(2);
                    config[1].should.equal(testConfig[1]);
                }
            })

            core.setConfig(testConfig);
        });
    });

    describe('Test setConfig environment var switches', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var coreConfig = null;
        var testConfig;

        before(function () {
            core.__set__({
                "prepareInitDummy": function (config) {
                    coreConfig = config;
                }
            })
        });

        it('Test unset switch: ', function () {
            testConfig = [{
                core: true
            }];
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true });
        });

        it('Test set switch and unset env var: ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = undefined
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR", reduce: true });
        });

        it('Test set switch and set env var ("true"): ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = 'true';
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR" });
        });

        it('Test set switch and set env var ("True"): ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = 'True';
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR" });
        });

        it('Test set switch and set env var ("true"): ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = 'TRUE';
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR" });
        });

        it('Test set switch and set env var ("false"): ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = 'false';
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR", reduce: true });
        });

        it('Test set switch and set env var ("0"): ', function () {
            testConfig = [{
                core: true,
                envVarSwitch: "LOG_TEST_VAR"
            }];
            process.env.LOG_TEST_VAR = '0';
            core.setConfig(testConfig);
            coreConfig.length.should.equal(1);
            coreConfig[0].should.deep.equal({ core: true, envVarSwitch: "LOG_TEST_VAR", reduce: true });
        });
    });


    describe('Test validateObject', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        before(function () {
            core.setConfig(importFresh("../config.js").config);
        });

        it('Test equals method: ', function () {
            core.isValidObject(null).should.equal(false);
            core.isValidObject(undefined).should.equal(false);
            core.isValidObject({}).should.equal(false);
            core.isValidObject("test").should.equal(false);
            core.isValidObject(1).should.equal(false);
            core.isValidObject(1.0).should.equal(false);
            core.isValidObject(0).should.equal(false);
            core.isValidObject({
                "test": "hallo"
            }).should.equal(true);
        });

        it('Test for cyclic errors: ', function () {
            //cyclic obj test
            var a = {};
            var b = {};
            a.b = b;
            b.a = a;
            core.isValidObject(a).should.equal(true);
        });

    });

    describe('Test setLoggingLevel', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        before(function () {
            core.setConfig(importFresh("../config.js").config);
        });

        it("Test setLoggingLevel global", function () {
            core.setLoggingLevel("error");
            core.getLoggingLevel().should.equal("error");
            core.setLoggingLevel("info");
            core.getLoggingLevel().should.equal("info");
            core.setLoggingLevel("warn");
            core.getLoggingLevel().should.equal("warn");
            assert.isFalse(core.setLoggingLevel("something"));
            assert.isFalse(core.setLoggingLevel(null));
        });

        it("Test setLoggingLevel of child logger", function () {
            // set global level
            core.setLoggingLevel("error");

            var loggerA = core.createLogger()
            loggerA.setLoggingLevel("warn");
            loggerA.getLoggingLevel().should.equal("warn");

            var loggerB = loggerA.createLogger()
            loggerB.setLoggingLevel("debug");
            loggerB.getLoggingLevel().should.equal("debug");

            // after setting to null, global level should be used
            loggerB.setLoggingLevel(null);
            loggerB.getLoggingLevel().should.equal("warn");

            loggerA.setLoggingLevel(null);
            loggerB.getLoggingLevel().should.equal("error");
            loggerB.getLoggingLevel().should.equal("error");

            assert.isFalse(loggerA.setLoggingLevel("something"));
        });
    });



    describe('Test log output', function () {
        var core = null;

        var write;
        var clock;
        var output;

        before(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
            write = core.__get__("writeLogToConsole");
            core.setConfig(importFresh("../config.js").config);

            core.__set__({
                "stdout": {
                    write: function (data) {
                        output = data;
                    }
                }
            })

            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        afterEach(function () {
            core.setLogPattern(null);
        });

        it("Test log writing in (default) json mode", function () {
            var data = {
                test: "abc"
            };

            write(data);
            output.should.equal(JSON.stringify(data) + os.EOL);
        });

        it("Test  log writing in pattern mode with correct keys", function () {
            var data = {
                text: "abc",
                number: 21,
                obj: {
                    "id": 42
                }
            };

            core.setLogPattern("Test: {{text}} {{number}} {{obj}}");
            write(data)
            output.should.equal('Test: abc 21 ' + JSON.stringify(data.obj) + os.EOL);
        });

        it("Test  log writing in pattern mode with non-existing keys", function () {
            var data = {
                text: "abc",
                number: 21,
                object: {
                    "id": 42
                }
            };

            core.setLogPattern("Test: {{empty}}");

            write(data)
            output.should.equal("Test: " + os.EOL);
        });

        it("Test log writingwith faulty values", function () {
            var data;
            write(data);
            output.should.equal(os.EOL);

            core.setLogPattern(undefined);
            write(data);
            output.should.equal(os.EOL);

            core.setLogPattern("Test: {{empty}}");
            write(data);
            output.should.equal(os.EOL);

            core.setLogPattern("Test: {{empty}}");
            write(null);
            output.should.equal(os.EOL);
        });
    });

    describe('Test custom log sink', function () {
        var core = null;

        var write;
        var clock;
        var output;
        var level;

        before(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
            write = core.__get__("writeLogToConsole");
            core.setConfig(importFresh("../config.js").config);
            clock = sinon.useFakeTimers();
        });

        beforeEach(function () {
            core.setSinkFunction(function (lvl, out) {
                level = lvl;
                output = out;
            });
        })

        after(function () {
            clock.restore();
        });

        afterEach(function () {
            core.setLogPattern(null);
            core.setSinkFunction(null);
        });

        it("Test log writing in (default) json mode to custom log sink", function () {
            var data = {
                test: "abc",
                level: "warn"
            };

            write(data);
            output.should.equal(JSON.stringify(data));
            level.should.equal("warn");
        });

        it("Test  log writing in pattern mode with correct keys to custom log sink", function () {
            var data = {
                text: "abc",
                number: 21,
                obj: {
                    "id": 42
                },
                level: "info"
            };

            core.setLogPattern("Test: {{text}} {{number}} {{obj}}");
            write(data)
            output.should.equal('Test: abc 21 ' + JSON.stringify(data.obj));
            level.should.equal("info");
        });
    });

    describe('Test sendLog', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logMeta;
        var sendLog;

        before(function () {
            core.__set__({
                "writeLogToConsole": function (obj) {
                    logMeta = obj;
                }
            });
            core.setConfig(importFresh("../config.js").config);
            sendLog = core.__get__("sendLog");
        });

        beforeEach(function () {
            logMeta = null;
            core.setLoggingLevel("info");
        })

        it('Test simple json input', function () {
            sendLog({
                "field": "value"
            });
            logMeta.should.eql({ field: "value" });
        });

        it('Test complex json output', function () {
            sendLog({
                "field1": "value",
                "field2": 42,
                "field3": 47.11,
                "field4": {
                    "innerField": 73,
                    "innerArray": [{
                        "arrayField1": 1
                    }, {
                        "arrayField2": 2
                    }]
                }
            });
            logMeta.should.eql({ field1: "value", field2: 42, field3: 47.11, field4: { innerField: 73, innerArray: [{ arrayField1: 1 }, { arrayField2: 2 }] } });
        });
    });

    describe('Test getCorrelationId', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logObject = null;
        var getCorrelationId = null;

        before(function () {
            core.__set__({
                "sendLog": function (level, logObj) {
                    logObject = logObj;
                }
            });
            core.setConfig(importFresh("../config.js").config);

            getCorrelationId = core.__get__("getCorrelationId");
        });

        it('Test correct reading from request', function () {
            var testRequest = {};
            testRequest.logObject = {
                "correlation_id": "456"
            };
            testRequest.getCorrelationId = getCorrelationId;
            testRequest.getCorrelationId().should.equal("456");
        });

        it('Test correct handling of missing correlation_id', function () {
            var testRequest = {};
            testRequest.logObject = {};
            testRequest.getCorrelationId = getCorrelationId;
            assert.isNull(testRequest.getCorrelationId());
        });

        it('Test correct handling of missing logObject', function () {
            var testRequest = {};
            testRequest.getCorrelationId = getCorrelationId;
            assert.isNull(testRequest.getCorrelationId());
        });
    });


    describe('Test setCorrelationId', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logObject = null;
        var setCorrelationId = null;
        var testRequest;
        var uuid = require('uuid/v4');
        var testId;

        before(function () {
            core.setConfig(importFresh("../config.js").config);
            setCorrelationId = core.__get__("setCorrelationId");
        });

        beforeEach(function () {

            testRequest = {};
            testRequest.setCorrelationId = setCorrelationId;
        });

        it('Test correct writing to request', function () {
            testRequest.logObject = {
                "correlation_id": "456"
            };
            testId = uuid();


            assert.isTrue(testRequest.setCorrelationId(testId));
            testRequest.logObject.correlation_id.should.equal(testId);
        });

        it('Test correct handling of faulty uuid', function () {
            testRequest.logObject = {
                "correlation_id": "456"
            };
            testId = "faulty";


            assert.isFalse(testRequest.setCorrelationId(testId));
            testRequest.logObject.correlation_id.should.equal("456");
        });

        it('Test correct handling of missing logObject', function () {
            testId = uuid();

            assert.isFalse(testRequest.setCorrelationId(testId));
        });
    });

    describe('Test getTenantId', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logObject = null;
        var getTenantId = null;

        before(function () {
            core.__set__({
                "sendLog": function (level, logObj) {
                    logObject = logObj;
                }
            });
            core.setConfig(importFresh("../config.js").config);

            getTenantId = core.__get__("getTenantId");
        });

        it('Test correct reading from request', function () {
            var testRequest = {};
            testRequest.logObject = {
                "tenant_id": "456"
            };
            testRequest.getTenantId = getTenantId;
            testRequest.getTenantId().should.equal("456");
        });

        it('Test correct handling of missing tenant_id', function () {
            var testRequest = {};
            testRequest.logObject = {};
            testRequest.getTenantId = getTenantId;
            assert.isNull(testRequest.getTenantId());
        });

        it('Test correct handling of missing logObject', function () {
            var testRequest = {};
            testRequest.getTenantId = getTenantId;
            assert.isNull(testRequest.getTenantId());
        });
    });

    describe('Test setTenantId', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var setTenantId = null;
        var testRequest;
        var testId;

        before(function () {
            core.setConfig(importFresh("../config.js").config);
            setTenantId = core.__get__("setTenantId");
        });

        beforeEach(function () {

            testRequest = {};
            testRequest.setTenantId = setTenantId;
        });

        it('Test correct writing to request', function () {
            testRequest.logObject = {
                "tenant_id": "456"
            };
            testId = "789"


            assert.isTrue(testRequest.setTenantId(testId));
            testRequest.logObject.tenant_id.should.equal(testId);
        });

        it('Test correct handling of missing logObject', function () {
            testId = "456";

            assert.isFalse(testRequest.setTenantId(testId));
        });
    });

    describe('Test createLogger/getLogger', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var createLogger;
        var uuid;
        var oldLogMessage;
        var level;
        var levels;

        before(function () {
            core.init();
            core.setConfig(importFresh("../config.js").config);
            createLogger = core.__get__("createLogger");
            oldLogMessage = core.__get__("logMessage");
            levels = core.__get__("LOGGING_LEVELS");
            core.__set__("logMessage", function () {
                level = arguments[0];
                oldLogMessage(arguments);
            })
            uuid = require('uuid/v4');
        });

        it('Test correct new logger', function () {
            var obj = createLogger();
            obj.logObject.correlation_id.should.be.a("string");
            var correlation_id = obj.logObject.correlation_id;
            obj.getCorrelationId().should.equal(correlation_id);
            obj.setCorrelationId(uuid());
            obj.getCorrelationId().should.not.equal(correlation_id);
            obj.customFields.should.eql({});
        });

        it('Test correct new logger (inherited)', function () {
            var parent = createLogger();
            var obj = parent.createLogger();
            obj.logObject.should.equal(parent.logObject);
            obj.customFields.should.eql({});
            obj.parent.should.equal(parent);
        });

        it('Test correct new logger (inherited) with additional custom fields', function () {
            var parent = createLogger();
            var obj = parent.createLogger({ "test-field-a": 42 });
            obj.logObject.should.equal(parent.logObject);
            obj.customFields.should.eql({ "test-field-a": 42 });
            obj.parent.should.equal(parent);
        });

        it('Test correct correlation to req object', function () {
            var req = {};
            core.bindLoggerToRequest(req, {});
            req.logger.setCorrelationId(uuid());

            var logger1 = req.getLogger();
            var logger2 = req.getLogger();
            var logger3 = req.createLogger();

            // check correlation id inheritance
            logger1.getCorrelationId().should.equal(req.logger.getCorrelationId());
            
            // set a new correlation id using logger2
            logger2.setCorrelationId(uuid());

            // check reverse propagation
            req.logger.getCorrelationId().should.equal(logger2.getCorrelationId());
            logger1.getCorrelationId().should.equal(logger2.getCorrelationId());

            // check inheritance
            logger3.getCorrelationId().should.equal(logger2.getCorrelationId());

            // set a new correlation id using logger3
            logger3.setCorrelationId(uuid());

            // check reverse propagation
            req.logger.getCorrelationId().should.equal(logger3.getCorrelationId());
            logger1.getCorrelationId().should.equal(logger3.getCorrelationId());
            logger2.getCorrelationId().should.equal(logger3.getCorrelationId());
        });

        it('test convenience log methods', function () {
            var logger = createLogger();
            for (var lvl in levels) {
                assert.isNotNull(logger[lvl]);
                logger[lvl]("test");
                level.should.equal(lvl);
            }
        });

        it('test convenience level severity methods', function () {
            var logger = createLogger();
            logger.setLoggingLevel("verbose");
            for (var lvl in levels) {
                var methodName = "is" + lvl.charAt(0).toUpperCase() + lvl.slice(1);
                assert.isNotNull(logger[methodName]);
                assert.equal(logger[methodName](), levels[lvl] <= levels["verbose"]);
            }
        });
    });

    describe('Test custom fields registration and setter', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        before(function () {

        });

        describe('Test custom fields registration', function () {
            it("Test null array", function () {
                core.registerCustomFields(null).should.equal(false);
                core.__get__("registeredCustomFields").should.eql([]);
            });

            it("Test empty array", function () {
                core.registerCustomFields([]).should.equal(true);
                core.__get__("registeredCustomFields").should.eql([]);
            });

            it("Test valid array fields", function () {
                core.registerCustomFields(["test-field-a", "test-field-b"]).should.equal(true);
                core.__get__("registeredCustomFields").should.eql(["test-field-a", "test-field-b"]);
            });

            it("Test invalid array fields", function () {
                core.registerCustomFields(["test-field-a", 4711]).should.equal(false);
                core.__get__("registeredCustomFields").should.eql([]);
            });
        });

        describe('Test custom fields setter (global)', function () {
            it("Test null object", function () {
                core.setCustomFields(null).should.equal(false);
            });

            it("Test empty", function () {
                core.setCustomFields({}).should.equal(true);
                core.__get__("globalCustomFields").should.eql({});
            });

            it("Test valid fields", function () {
                core.setCustomFields({ "test-field-a": 42, "test-field-b": "test" }).should.equal(true);
                core.__get__("globalCustomFields").should.eql({ "test-field-a": 42, "test-field-b": "test" });
            });

            it("Test empty/clearing", function () {
                core.setCustomFields({ "test-field-a": "a" });
                core.__get__("globalCustomFields").should.eql({ "test-field-a": "a" });
                core.setCustomFields({}).should.equal(true);
                core.__get__("globalCustomFields").should.eql({});
            });
        });

        describe('Test custom fields setter (logger)', function () {
            var logger;

            beforeEach(function () {
                logger = core.createLogger();
            });

            it("Test null object", function () {
                logger.setCustomFields(null).should.equal(false);
            });

            it("Test valid fields", function () {
                logger.setCustomFields({ "test-field-a": 42, "test-field-b": "test" }).should.equal(true);
                logger.customFields.should.eql({ "test-field-a": 42, "test-field-b": "test" });
            });

            it("Test empty/clearing", function () {
                logger.setCustomFields({ "test-field-a": "a" });
                logger.customFields.should.eql({ "test-field-a": "a" });
                logger.setCustomFields({}).should.equal(true);
                logger.customFields.should.eql({});
            });
        });
    });

    describe('Test logMessage', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        var logObject = null;
        var log = null;
        var registerCustomFields = null;
        var setCustomFields = null;

        before(function () {
            core.__set__({
                "sendLog": function (logObj) {
                    logObject = logObj;
                }
            });
            core.setConfig(importFresh("../config.js").config);

            log = core.logMessage;
            registerCustomFields = core.registerCustomFields;
            setCustomFields = core.setCustomFields;
        });

        it("Test simple log", function () {
            log("info", "Test");
            logObject.msg.should.equal("Test");
        });

        it("Test empty log", function () {
            log("info", "");
            logObject.msg.should.equal("");
        });

        it("Test numeric parameter log", function () {
            log("info", "Test %d");
            logObject.msg.should.equal("Test %d");

            log("info", "Test %d", 42);
            logObject.msg.should.equal("Test 42");

            log("info", "Test %d %d", 42, 73);
            logObject.msg.should.equal("Test 42 73");
        });

        it("Test string parameter log", function () {
            log("info", "Test %s");
            logObject.msg.should.equal("Test %s");

            log("info", "Test %s", "abc");
            logObject.msg.should.equal("Test abc");

            log("info", "Test %s %s", "abc", "def");
            logObject.msg.should.equal("Test abc def");
        });

        it("Test json parameter log", function () {
            log("info", "Test %j", {
                "field": "value"
            }, null);
            logObject.msg.should.equal('Test {"field":"value"}');
        });

        it("Test mixed parameter log", function () {
            log("info", "Test %s %d %j", "abc", 42, {
                "field": "value"
            }, null);
            logObject.msg.should.equal('Test abc 42 {"field":"value"}');
        });

        it("Test custom fields log output (number)", function () {
            log("info", "Test", 42);

            logObject.msg.should.equal('Test 42');
        });

        it("Test custom fields log output (object)", function () {
            // Register only two of three fields
            registerCustomFields(["fieldA", "fieldC"]);

            log("info", "Test", {
                "fieldA": "valueA",
                "fieldB": "valueB",
                "fieldC": "valueC"
            });

            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({
                "fieldA": "valueA",
                "fieldC": "valueC"
            });
        });

        it("Test custom fields log output (convert array to object)", function () {
            registerCustomFields(["0", "1", "2"]);

            log("info", "Test", [
                1, "123", { "field": "values" }
            ]);

            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({ "0": "1", "1": "123", "2": "{\"field\":\"values\"}" });
        });

        it("Test custom fields inheritance", function () {
            // Register fields
            registerCustomFields(["fieldA", "fieldB", "fieldC"]);

            // Set global custom fields
            setCustomFields({ fieldA: "a", fieldB: "b" });

            // Create logger and overwrite global custom field
            var loggerA = core.createLogger({ fieldA: "c" });

            // Create logger (child of loggerA) and overwrite/add fields
            var loggerB = loggerA.createLogger();
            loggerB.setCustomFields({ fieldA: "d", fieldC: "c" });

            // Create logger (child of loggerA) and add unregistered field
            var loggerC = loggerA.createLogger();
            loggerC.setCustomFields({ fieldU: "u" });

            // global fields only
            log("info", "Test", {});
            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({
                "fieldA": "a",
                "fieldB": "b"
            });

            // loggerA fields and non-overwritten global fields
            loggerA.logMessage("info", "Test", {});
            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({
                "fieldA": "c",
                "fieldB": "b"
            });

            // loggerB fields and inherited loggerA and global fields
            loggerB.logMessage("info", "Test", {});
            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({
                "fieldA": "d",
                "fieldB": "b",
                "fieldC": "c"
            });

            // inherited loggerA/global fields and NOT unknown field 'fieldU'
            loggerC.logMessage("info", "Test", {});
            logObject.msg.should.equal('Test');
            logObject.custom_fields.should.eql({
                "fieldA": "c",
                "fieldB": "b"
            });
        });

        it("Test custom fields log type consistency (objects)", function () {
            var obj = {
                "fieldString": "value",
                "fieldNumber": 123,
                "fieldObj": { a: 456 },
                "fieldArray": [7, 8, 9]
            };

            log("info", "Test", obj);

            assert.isString(obj.fieldString);
            assert.isNumber(obj.fieldNumber);
            assert.isObject(obj.fieldObj);
            assert.isArray(obj.fieldArray);
        });

        it("Test custom fields log type consistency (circular objects)", function () {

            // Register fields
            registerCustomFields(["fieldA"]);

            var fieldA = {
                a: 456,
            }

            var fieldB = {
                b: 123,
                a: fieldA
            }

            // create circular reference a -> b -> a ...
            fieldA.b = fieldB;

            var obj = {
                "fieldA": fieldA,
            };

            log("info", "Test", obj);

            logObject.custom_fields.should.eql({
                "fieldA": "{\"a\":456,\"b\":{\"b\":123,\"a\":\"[Circular ~]\"}}"
            });
        });

        it("Test custom fields log type consistency (arrays)", function () {
            var obj = ["value", 123, { a: 456 }, [7, 8, 9]];

            log("info", "Test", obj);

            assert.isString(obj[0]);
            assert.isNumber(obj[1]);
            assert.isObject(obj[2]);
            assert.isArray(obj[3]);
        });

        it("Test parameter and custom fields log", function () {
            registerCustomFields(["string", "int", "obj"]);

            log("info", "Test %s", "abc", {
                "string": "text",
                "int": 0,
                "obj": {
                    "test": "value"
                }
            });

            logObject.msg.should.equal('Test abc');
            logObject.custom_fields.should.eql({
                "string": "text",
                "int": "0",
                "obj": "{\"test\":\"value\"}"
            });
        });


        it("Test unregistered custom fields log", function () {
            registerCustomFields(["int"]);

            log("info", "Test %s", "abc", {
                "string": "text",
                "int": 0,
                "obj": {
                    "test": "value"
                }
            });

            logObject.msg.should.equal('Test abc');
            logObject.custom_fields.should.eql({
                "int": "0",
            });
        });

        it("Test logLevel catch", function () {
            assert.isTrue(log("info", "message delivered"));
            assert.isFalse(log("verbose", "message delivered"));
        });

        it("Test correctly bound request id", function () {
            var testRequest = {};
            testRequest.logObject = {
                "request_id": "456"
            };
            testRequest.log = log;
            testRequest.log("info", "Test");
            logObject.msg.should.equal("Test");
            logObject.request_id.should.equal("456");
        });

        it("Test correctly bound correlation id", function () {
            var testRequest = {};
            testRequest.logObject = {
                "correlation_id": "123"
            };
            testRequest.log = log;
            testRequest.log("info", "Test");
            logObject.msg.should.equal("Test");
            logObject.correlation_id.should.equal("123");
        });


        it("Test correctly bound tenant id", function () {
            var testRequest = {};
            testRequest.logObject = {
                "tenant_id": "789"
            };
            testRequest.log = log;
            testRequest.log("info", "Test");
            logObject.msg.should.equal("Test");
            logObject.tenant_id.should.equal("789");
        });
    });

    describe('Test init', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        var header;
        var defaultHeader;
        var envHeaderVariable;

        beforeEach(function () {
            core.__set__({
                "writeLogToConsole": function (obj) {
                    logMeta = obj;
                    logLevel = obj.level;
                }
            });
            core.setConfig(importFresh("../config.js").config);
            defaultHeader = core.__get__("DEFAULT_DYN_LOG_LEVEL_HEADER");
            envHeaderVariable = core.__get__("ENV_DYN_LOG_HEADER");
            process.env[envHeaderVariable] = null;
        });

        it('test default behaviour', function () {
            core.init();
            header = core.__get__("dynLogLevelHeader");
            header.should.equal(defaultHeader);
            process.env[envHeaderVariable] = "";
            core.init();
            header = core.__get__("dynLogLevelHeader");
            header.should.equal(defaultHeader);

        });

        it('testing reading from correct env Variable', function () {
            process.env[envHeaderVariable] = "test";
            core.init();
            header = core.__get__("dynLogLevelHeader");
            header.should.equal("test");
            process.env[envHeaderVariable] = "";
            core.init();
            header = core.__get__("dynLogLevelHeader");
            header.should.equal(defaultHeader);
        });



    });

    describe('Test initLog', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var logObject;
        var clock;

        before(function () {
            // set clock to 2017-01-01T00:00:00.000Z
            clock = sinon.useFakeTimers({now: 1483228800000});
        });

        beforeEach(function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "application_id": "123456",
                "application_name": "test_app_name",
                "instance_index": "42",
                "space_name": "test_space_name",
                "space_id": "234567",
                "instance_index": "43",
                "organization_name": "test_org_name",
                "organization_id": "345678"
            });
            process.env.CF_INSTANCE_IP = "45";
            core.setConfig(importFresh("../config.js").config);
            logObject = null;
        });

        after(function () {
            clock.restore();
        });

        it('Test written_at: ', function () {
            logObject = core.initLog();
            logObject.written_at.should.equal((new Date()).toJSON());

            logObject = core.initLog();
            clock.tick(1);
            logObject.written_at.should.not.equal((new Date()).toJSON());
        });

        it('Test written_ts: ', function () {
            logObject = core.initLog();
            logObject.written_ts.should.equal((new Date()).getTime() * 1e6);
        });

        // Write values from process.env.VCAP_APPLICATION
        it('Test component_id: ', function () {
            logObject = core.initLog();
            logObject.component_id.should.equal("123456");
        });

        it('Test component_name: ', function () {
            logObject = core.initLog();
            logObject.component_name.should.equal("test_app_name");
        });

        it('Test component_instance: ', function () {
            logObject = core.initLog();
            logObject.component_instance.should.equal("43");
        });

        it('Test space_name: ', function () {
            logObject = core.initLog();
            logObject.space_name.should.equal("test_space_name");
        });

        it('Test space_id: ', function () {
            logObject = core.initLog();
            logObject.space_id.should.equal("234567");
        });

        it('Test organization_name: ', function () {
            logObject = core.initLog();
            logObject.organization_name.should.equal("test_org_name");
        });

        it('Test organization_id: ', function () {
            logObject = core.initLog();
            logObject.organization_id.should.equal("345678");
        });

        it('Test source_instance: ', function () {
            logObject = core.initLog();
            logObject.source_instance.should.equal("43");
        });

        it('Test container_id: ', function () {
            logObject = core.initLog();
            logObject.container_id.should.equal("45");
        });


        it('Test default values: ', function () {
            delete process.env.VCAP_APPLICATION;
            delete process.env.CF_INSTANCE_IP;
            //resetting inherit memory for fast init
            var core2 = rewire("../cf-nodejs-logging-support-core/log-core.js");
            core2.__set__("initDummy", null);
            core2.setConfig(importFresh("../config.js").config);
            //rewrite process to old values
            //init object
            logObject = core2.initLog();
            //assertions
            logObject.component_id.should.equal("-");
            logObject.component_name.should.equal("-");
            logObject.component_instance.should.equal("0");
            logObject.space_name.should.equal("-");
            logObject.space_id.should.equal("-");
            logObject.organization_name.should.equal("-");
            logObject.organization_id.should.equal("-");
            logObject.source_instance.should.equal("0");
            logObject.container_id.should.equal("-");
        });

        it('Test static values: ', function () {
            logObject = core.initLog();
            logObject.component_type.should.equal("application");
            logObject.layer.should.equal("[NODEJS]");
            logObject.logger.should.equal("nodejs-logger");
        });
    });

    describe('Test overrideField', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var values = {};
        var overrideField = null;

        beforeEach(function () {
            values = {};
            core.__set__({
                "fixedValues": values
            });
            core.setConfig(importFresh("../config.js").config);
            overrideField = core.__get__("overrideField");

        });

        it("testing corect values", function () {
            assert.isTrue(overrideField("msg", "test"));
            values["msg"].should.equal("test");
            assert.isTrue(overrideField("msg", "test2"));
            values["msg"].should.equal("test2");
        });

        it("testing resetting values", function () {
            overrideField("msg", "test");
            values["msg"].should.equal("test");
            assert.isTrue(overrideField("msg", undefined));
            assert.equal(values["msg"], null);
            overrideField("msg", "test");
            values["msg"].should.equal("test");
            assert.isTrue(overrideField("msg", null));
            assert.equal(values["msg"], null);
        });

        it("testing incorrect values values", function () {
            assert.isFalse(overrideField(1, false));
        });
    });

    describe('test DynamicLogLevel', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");
        var req;
        var levels;

        before(function () {
            levels = core.__get__("LOGGING_LEVELS");
            core.__set__("sendLog", function (logObject) {
            });
        });

        beforeEach(function () {
            req = {};
            core.bindLoggerToRequest(req, {});
        });

        it("test setDynamicLogLevel", function () {
            req.logger.setDynamicLoggingLevel("error");
            assert.equal(req.logger.dynamicLogLevelInt, levels["error"]);
            req.logger.setDynamicLoggingLevel("info");
            assert.equal(req.logger.dynamicLogLevelInt, levels["info"]);
        })

        it("test logMessage with dynamicLogLevel", function () {
            req.logger.setDynamicLoggingLevel("info");
            assert.isTrue(req.logger.logMessage("info", "will go through"));
            req.logger.setDynamicLoggingLevel("error");
            assert.isFalse(req.logger.logMessage("info", "will not go through"));
        });
    });

    describe('Test DynlogLevel', function () {
        var core = rewire("../cf-nodejs-logging-support-core/log-core.js");

        var header;
        var defaultHeader;
        var envHeaderVariable;
        var getLogLevelFromName;
        var verifyAndDecodeJWT;

        before(function () {
            core.__set__({
                "writeLogToConsole": function (obj) {
                    logMeta = obj;
                    logLevel = obj.level;
                }
            });
            verifyAndDecodeJWT = core.__get__("verifyAndDecodeJWT");
            getLogLevelFromName = core.__get__("getLogLevelFromName");
            envHeaderVariable = core.__get__("ENV_DYN_LOG_HEADER");
            process.env[envHeaderVariable] = null;
        });

        it("test bindDynLogLevel", function () {
            core.__set__({
                "verifyAndDecodeJWT": function (token, key) {
                    if (!token) {
                        return null;
                    } else {
                        var payload = {};
                        payload.level = "error";
                        return payload;
                    }
                }
            });
            var req = { logger: {} };
            core.bindDynLogLevel(null, req.logger);
            assert.isUndefined(req.logger.dynamicLogLevelInt);
            core.bindDynLogLevel(1, req.logger);
            req.logger.dynamicLogLevelInt.should.equal(0);
        });

        it("test getLogLevelFromName", function () {
            var res = getLogLevelFromName("error");
            res.should.equal(0);
            res = getLogLevelFromName("test123");
            assert.isNull(res);
            res = getLogLevelFromName(null);
            assert.isNull(res);

        });

        it("test verifyAndDecodeJWT", function () {
            var private_correct = fs.readFileSync("./test/jwtRS256_correct.key").toString('utf8');
            var private_wrong = fs.readFileSync("./test/jwtRS256_wrong.key").toString('utf8');
            var public_key = fs.readFileSync("./test/jwtRS256.key.pub").toString('utf8');
            var public_key_missing_desc = fs.readFileSync("./test/jwtRS256_missing_desc.key.pub").toString('utf8');

            var token_correct = jwt.sign({ "level": "error" }, private_correct, { algorithm: 'RS256' });
            var token_wrong = jwt.sign({ "level": "error" }, private_wrong, { algorithm: 'RS256' });

            var res = verifyAndDecodeJWT(token_correct, public_key);
            res.level.should.equal("error");
            res = verifyAndDecodeJWT(token_wrong, public_key);
            assert.isNull(res);

            res = null;
            res = verifyAndDecodeJWT(token_correct, public_key_missing_desc);
            res.level.should.equal("error");
            res = verifyAndDecodeJWT(token_wrong, public_key_missing_desc);
            assert.isNull(res);

        });
    });
});