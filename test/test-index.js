var chai = require("chai");
var Module = require('module');
var linking = null;
var req = null;
var res = null;
var next = null;
var loggingLevel = null;
var messageArgs = null;
var originalRequire = Module.prototype.require;

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
            }
        };
    }
    return originalRequire.apply(this, arguments);
};
var logger = require("../index.js");
var assert = chai.assert;
chai.should();

describe('Test index.js', function () {
    describe('setLoggingLevel', function () {

        it('Test forceLogger: ', function () {
            logger.forceLogger("express");
            linking.should.equal("express");
            logger.forceLogger("restify");
            linking.should.equal("restify");
            logger.forceLogger("testing defaulting");
            linking.should.equal("express");
        });

        it('testing setLoggingLevel: ', function () {
            var level = "testLevel";
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("restify");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
        });

        it('testing logMessage: ', function () {
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
