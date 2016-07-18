var chai = require("chai");
var rewire = require("rewire");
//var assert = chai.assert;
chai.should();
var sinon = require("sinon");
var rewire = require("rewire");

describe('Test log-core', function () {

    var core = null;

    describe('Test validateObject', function () {

        before(function () {
            core = require("../cf-nodejs-logging-support-core/log-core.js");
        });

        it('Test equals method: ', function () {
            core.validObject(null).should.equal(false);
            core.validObject(undefined).should.equal(false);
            core.validObject({}).should.equal(false);
            core.validObject("test").should.equal(false);
            core.validObject(1).should.equal(false);
            core.validObject(1.0).should.equal(false);
            core.validObject(0).should.equal(false);
            core.validObject({
                "test": "hallo"
            }).should.equal(true);
        });

        it('Test for cyclic errors: ', function () {
            //cyclic obj test
            var a = {};
            var b = {};
            a.b = b;
            b.a = a;
            core.validObject(a).should.equal(true);
        });

    });

    describe('Test setLoggingLevel', function () {
        it("Test settingLoggingLevel", function () {
            core.setLoggingLevel("error");
            core.getLoggingLevel().should.equal("error");
            core.setLoggingLevel("log");
            core.getLoggingLevel().should.equal("log");
            core.setLoggingLevel("test");
            core.getLoggingLevel().should.equal("test");
        });
    });


    describe('Test winstonTransport', function () {

        var transport;
        var clock;

        before(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
            transport = core.__get__("consoleTransport");
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        it("Test transport.timestamp", function () {
            transport.timestamp().should.equal(0);
        });

        it("Test transport.level", function () {
            transport.level.should.equal("info");
        });

        it("Test transport.formatter", function () {
            var options = {};
            options.message = "test";
            transport.formatter({}).should.equal("");
            transport.formatter(options).should.equal("test");
        });
    });


    describe('Test sendLog', function () {
        var logText;
        var logLevel;
        var sendLog;

        before(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
            core.__set__({
                "winstonLogger": {
                    "log": function (level, text) {
                        logText = text;
                        logLevel = level;

                    }
                }
            });

            sendLog = core.__get__("sendLog");
        });

        it('Test level', function () {
            sendLog("testLevel", {});
            logLevel.should.equal('testLevel');
        });

        it('Test empty json output', function () {
            sendLog("info", {});
            logText.should.equal('{}');
        });

        it('Test simple json output', function () {
            sendLog("info", {
                "field": "value"
            });
            logText.should.equal('{"field":"value"}');
        });

        it('Test complex json output', function () {
            sendLog("info", {
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
            logText.should.equal('{"field1":"value","field2":42,"field3":47.11,"field4":{"innerField":73,"innerArray":[{"arrayField1":1},{"arrayField2":2}]}}');
        });
    });


    describe('Test logMessage', function () {

        var logObject = null;
        var log = null;

        before(function () {
            core = rewire("../cf-nodejs-logging-support-core/log-core.js");
            core.__set__({
                "sendLog": function (level, logObj) {
                    logObject = logObj;
                }
            });

            log = core.__get__("logMessage");
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

        it("Test custom fields log", function () {
            log("info", "Test", {
                "field": "value"
            });

            logObject.msg.should.equal('Test');
            JSON.stringify(logObject.custom_fields).should.equal(JSON.stringify({
                "field": "value"
            }));
        });

        it("Test parameter and custom fields log", function () {
            log("info", "Test %s", "abc", {
                "field": "value"
            });

            logObject.msg.should.equal('Test abc');
            JSON.stringify(logObject.custom_fields).should.equal(JSON.stringify({
                "field": "value"
            }));
        });
    });

    describe('Test initLog', function () {

        before(function () {
            core = require("../cf-nodejs-logging-support-core/log-core.js");
        });

        var logObject = null;
        var clock;

        before(function () {
            logObject = {};
            clock = sinon.useFakeTimers();
        });

        after(function () {
            clock.restore();
        });

        afterEach(function () {
            delete process.env.VCAP_APPLICATION;
            delete process.env.CF_INSTANCE_IP;
        });

        it('Test written_at: ', function () {
            core.initLog(logObject, null);
            logObject.written_at.should.equal((new Date()).toJSON());

            core.initLog(logObject, null);
            clock.tick(1);
            logObject.written_at.should.not.equal((new Date()).toJSON());
        });

        it('Test written_ts: ', function () {
            var time = [42, 73];
            core.initLog(logObject, time);
            logObject.written_ts.should.equal(time[0] * 1e9 + time[1]);
        });

        // Write values from process.env.VCAP_APPLICATION
        it('Test component_id: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "application_id": "123456789"
            });
            core.initLog(logObject, null);
            logObject.component_id.should.equal("123456789");
        });

        it('Test component_name: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "application_name": "correct_name"
            });
            core.initLog(logObject, null);
            logObject.component_name.should.equal("correct_name");
        });

        it('Test component_instance: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "instance_index": "42"
            });
            core.initLog(logObject, null);
            logObject.component_instance.should.equal("42");
        });

        it('Test space_name: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "space_name": "correct_name"
            });
            core.initLog(logObject, null);
            logObject.space_name.should.equal("correct_name");
        });

        it('Test space_id: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "space_id": "123456789"
            });
            core.initLog(logObject, null);
            logObject.space_id.should.equal("123456789");
        });

        it('Test source_instance: ', function () {
            process.env.VCAP_APPLICATION = JSON.stringify({
                "instance_index": "42"
            });
            core.initLog(logObject, null);
            logObject.source_instance.should.equal("42");
        });

        it('Test container_id: ', function () {
            process.env.CF_INSTANCE_IP = "42";
            core.initLog(logObject, null);
            logObject.container_id.should.equal("42");
        });


        it('Test default values: ', function () {
            core.initLog(logObject, null);
            logObject.component_id.should.equal("-");
            logObject.component_name.should.equal("-");
            logObject.component_instance.should.equal("0");
            logObject.space_name.should.equal("-");
            logObject.space_id.should.equal("-");
            logObject.source_instance.should.equal("0");
            logObject.container_id.should.equal("-");
        });

        it('Test static values: ', function () {
            core.initLog(logObject, null);
            logObject.component_type.should.equal("application");
            logObject.layer.should.equal("[NODEJS]");
            logObject.logger.should.equal("nodejs-logger");
        });
    });
});
