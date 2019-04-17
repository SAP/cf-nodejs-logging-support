const importFresh = require('import-fresh');
var chai = require("chai");
var Module = require('module');
var linking = null;
var req = null;
var res = null;
var next = null;
var field = null;
var value = null;
var loggingLevel = null;
var messageArgs = null;
var logPattern = null;
var originalRequire = Module.prototype.require;


var logger = importFresh("../index.js");
var assert = chai.assert;
chai.should();

describe('Test index.js', function () {
    var origRequire = Module.prototype.require;
    before(function () {
        Module.prototype.require = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args[0] === "./cf-nodejs-logging-support-express/log-express") {
                linking = "express";
                return {
                    "setCoreLogger": function () {},
                    "setConfig": function () {},
                    "logNetwork": function (req1, res1, next1) {
                        req = req1;
                        res = res1;
                        next = next1;
                    },
                    "setLoggingLevel": function (level) {
                        loggingLevel = level;
                    },
                    "logMessage": function (args) {
                        messageArgs = args;
                    },
                    "getCorrelationObject": function () {
                        return {
                            test: "express"
                        };
                    },
                    "overrideField": function (field1, value1) {
                        field = field1;
                        value = value1;
                    },
                    "setLogPattern": function (pattern) {
                        logPattern = pattern
                    } 
                };
            }
            if (args[0] === "./cf-nodejs-logging-support-restify/log-restify") {
                linking = "restify";
                return {
                    "setCoreLogger": function () {},
                    "setConfig": function () {},
                    "logNetwork": function (req1, res1, next1) {
                        req = req1;
                        res = res1;
                        next = next1;
                    },
                    "setLoggingLevel": function (level) {
                        loggingLevel = level;
                    },
                    "logMessage": function (args) {
                        messageArgs = args;
                    },
                    "getCorrelationObject": function () {
                        return {
                            test: "restify"
                        };
                    },
                    "overrideField": function (field1, value1) {
                        field = field1;
                        value = value1;
                    },
                    "setLogPattern": function (pattern) {
                        logPattern = pattern
                    } 
                };
            }
            if (args[0] === "./cf-nodejs-logging-support-plainhttp/log-plainhttp") {
                linking = "plainhttp";
                return {
                    "setCoreLogger": function () {},
                    "setConfig": function () {},
                    "logNetwork": function (req1, res1) {
                        req = req1;
                        res = res1;
                    },
                    "setLoggingLevel": function (level) {
                        loggingLevel = level;
                    },
                    "logMessage": function (args) {
                        messageArgs = args;
                    },
                    "getCorrelationObject": function () {
                        return {
                            test: "plainhttp"
                        };
                    },
                    "overrideField": function (field1, value1) {
                        field = field1;
                        value = value1;
                    },
                    "setLogPattern": function (pattern) {
                        logPattern = pattern;
                    } 
                };
            }
            return originalRequire.apply(this, arguments);
        };
    });

    beforeEach(function () {
        logger.forceLogger("default");
    });

    after(function () {
        Module.prototype.require = origRequire;
    });
    describe('setLoggingLevel', function () {

        it('Test forceLogger: ', function () {
            logger.forceLogger("express");
            linking.should.equal("express");
            logger.forceLogger("restify");
            linking.should.equal("restify");
            logger.forceLogger("plainhttp");
            linking.should.equal("plainhttp");
            logger.forceLogger("testing defaulting");
            linking.should.equal("express");
        });

        it('Test setLoggingLevel: ', function () {
            var level = "testLevel";
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("restify");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("plainhttp");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
        });

        it('Test getCorrelationObject: ', function () {
            var obj = {};
            obj.test = "express";
            logger.getCorrelationObject().test.should.equal(obj.test);

            logger.forceLogger("restify");
            obj.test = "restify";
            logger.getCorrelationObject().test.should.equal(obj.test);

            logger.forceLogger("plainhttp");
            obj.test = "plainhttp";
            logger.getCorrelationObject().test.should.equal(obj.test);
        });

        it('Test createCorrelationObject: ', function () {
            logger.createCorrelationObject().logObject.correlation_id.should.not.equal(null);
            logger.createCorrelationObject().logObject.correlation_id.should.not.equal(logger.createCorrelationObject().logObject.correlation_id);
        });

        it('Test logMessage: ', function () {
            var message = "testLevel";
            logger.logMessage(message);
            message.should.equal(message);
        });

        it('Test overrideNetworkField', function () {
            var field1 = "test";
            var value1 = "value";
            logger.overrideNetworkField(field1, value1);
            field.should.equal(field1);
            value.should.equal(value1);

            logger.forceLogger("restify");
            logger.overrideNetworkField(field1, value1);
            field.should.equal(field1);
            value.should.equal(value1);

            logger.forceLogger("plainhttp");
            logger.overrideNetworkField(field1, value1);
            field.should.equal(field1);
            value.should.equal(value1);
        });

        it('Test logNetwork: ', function () {
            var obj1 = {};
            var obj2 = {};
            var obj3 = {};
            logger.logNetwork(obj1, obj2, obj3);
            req.should.equal(obj1);
            res.should.equal(obj2);
            next.should.equal(obj3);


            logger.forceLogger("restify");

            obj1 = {};
            obj2 = {};
            obj3 = {};

            logger.logNetwork(obj1, obj2, obj3);
            req.should.equal(obj1);
            res.should.equal(obj2);
            next.should.equal(obj3);

            logger.forceLogger("plainhttp");

            obj1 = {};
            obj2 = {};

            logger.logNetwork(obj1, obj2);
            req.should.equal(obj1);
            res.should.equal(obj2);
        });

        it('Test winstonTransport: ', function () {
          /*  var obj = logger.createWinstonTransport();
            assert.typeOf(obj, "object");*/
        });

        it('Test setLogPattern: ' , function () {
            var pattern = "testing pattern {{msg}}";
            logger.setLogPattern(pattern);
            logPattern.should.equal(pattern);

            logger.forceLogger("restify");
            logger.setLogPattern(pattern + "restify");
            logPattern.should.equal(pattern + "restify");
            

            logger.forceLogger("plainhttp");
            logger.setLogPattern(pattern + "plain");
            logPattern.should.equal(pattern + "plain");
        });

    });
});