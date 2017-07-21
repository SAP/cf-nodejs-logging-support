var chai = require("chai");
var Module = require('module');
var linking = null;
var req = null;
var res = null;
var next = null;
var loggingLevel = null;
var messageArgs = null;
var originalRequire = Module.prototype.require;


var logger = require("../index.js");
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
                    "getCorrelationObject": function() {
                        return {test: "express"};
                    }
                };
            }
            if (args[0] === "./cf-nodejs-logging-support-restify/log-restify") {
                linking = "restify";
                return {
                    "setCoreLogger": function () {},
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
                    "getCorrelationObject": function() {
                        return {test: "restify"};
                    }
                };
            }
            if (args[0] === "./cf-nodejs-logging-support-plainhttp/log-plainhttp") {
                linking = "plainhttp";
                return {
                    "setCoreLogger": function () {},
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
                    "getCorrelationObject": function() {
                        return {test: "plain"};
                    }
                };
            }
            return originalRequire.apply(this, arguments);
        };
    });

    after(function() {
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
        });

        it('Test setLoggingLevel: ', function () {
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

        it('Test logMessage: ', function () {
            var message = "testLevel";
            logger.logMessage(message);
            message.should.equal(message);
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
        });

        it('Test winstonTransport: ', function () {
            var obj = logger.winstonTransport;
            assert.typeOf(obj, "object");
            assert.typeOf(obj.timestamp, "function");
            assert.typeOf(obj.formatter, "function");
        });

    });
});