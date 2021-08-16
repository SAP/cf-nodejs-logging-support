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
var sinkFunction = null;
var messageArgs = null;
var logPattern = null;
var customFields = null;
var registeredFields = null;

var originalRequire = Module.prototype.require;
var logger;
var assert = chai.assert;
chai.should();

describe('Test index.js', function () {
    var origRequire = Module.prototype.require;
    before(function () {
        Module.prototype.require = function () {
            var args = Array.prototype.slice.call(arguments);
            if (args[0] === "./logger/log-express") {
                linking = "express";
                return {
                    "setCoreLogger": function () {},
                    "logNetwork": function (req1, res1, next1) {
                        req = req1;
                        res = res1;
                        next = next1;
                    }
                };
            }
            else if (args[0] === "./logger/log-restify") {
                linking = "restify";
                return {
                    "setCoreLogger": function () {},
                    "logNetwork": function (req1, res1, next1) {
                        req = req1;
                        res = res1;
                        next = next1;
                    }
                };
            }
            else if (args[0] === "./logger/log-plainhttp") {
                linking = "plainhttp";
                return {
                    "setCoreLogger": function () {},
                    "logNetwork": function (req1, res1) {
                        req = req1;
                        res = res1;
                    }
                };
            }
            else if (args[0] === "./logger/log-connect") {
                linking = "connect";
                return {
                    "setCoreLogger": function () {},
                    "logNetwork": function (req1, res1, next1) {
                        req = req1;
                        res = res1;
                        next = next1;
                    }
                };
            }
           else if (args[0] === "./core/log-core") {
                return {
                    "init": function() {},
                    "bindConvenienceMethods": function() {},
                    "createLogger": function(fields) { 
                        customFields = fields;
                    },
                    "setConfig": function () {},
                    "setLoggingLevel": function (level) {
                        loggingLevel = level;
                    },
                    "getLoggingLevel": function () {
                        return loggingLevel;
                    },
                    "isLoggingLevel": function (level) {
                        return level == "passLevel";
                    },
                    "setSinkFunction": function (fct) {
                        sinkFunction = fct;
                    },
                    "logMessage": function (args) {
                        messageArgs = Array.prototype.slice.call(arguments);
                    },
                    "overrideField": function (field1, value1) {
                        field = field1;
                        value = value1;
                    },
                    "setLogPattern": function (pattern) {
                        logPattern = pattern;
                    },
                    "setCustomFields": function(fields) {
                        customFields = fields;
                    }, 
                    "registerCustomFields": function(fieldNames) {
                        registeredFields = fieldNames;
                    }, 
                }
            }
            return originalRequire.apply(this, arguments);
        };

        logger = importFresh("../index.js");
    });

    beforeEach(function () {
        logger.forceLogger("default");
    });

    after(function () {
        Module.prototype.require = origRequire;
    });
    describe('Test parameter forwarding', function () {

        it('Test forceLogger', function () {
            logger.forceLogger("express");
            linking.should.equal("express");
            logger.forceLogger("restify");
            linking.should.equal("restify");
            logger.forceLogger("plainhttp");
            linking.should.equal("plainhttp");
            logger.forceLogger("connect");
            linking.should.equal("connect");
            logger.forceLogger("testing defaulting");
            linking.should.equal("express");
        });

        it('Test setLoggingLevel', function () {
            var level = "testLevel";
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("restify");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("plainhttp");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
            logger.forceLogger("connect");
            logger.setLoggingLevel(level);
            loggingLevel.should.equal(level);
        });

        it('Test getLoggingLevel', function () {
            var loggingLevel = "testLevel";
            logger.getLoggingLevel().should.equal(loggingLevel);
            logger.forceLogger("restify");
            logger.getLoggingLevel().should.equal(loggingLevel);
            logger.forceLogger("plainhttp");
            logger.getLoggingLevel().should.equal(loggingLevel);
            logger.forceLogger("connect");
            logger.getLoggingLevel().should.equal(loggingLevel);
        });

        it('Test isLoggingLevel', function () {
            logger.isLoggingLevel("passLevel").should.equal(true);
            logger.isLoggingLevel("noPassLevel").should.equal(false);
        });

        it('Test setSinkFunction', function () {
            var fct = (level, output) => {};
            logger.setSinkFunction(fct);
            sinkFunction.should.equal(fct);
            logger.forceLogger("restify");
            logger.setSinkFunction(fct);
            sinkFunction.should.equal(fct);
            logger.forceLogger("plainhttp");
            logger.setSinkFunction(fct);
            sinkFunction.should.equal(fct);
            logger.forceLogger("connect");
            logger.setSinkFunction(fct);
            sinkFunction.should.equal(fct);
        });

        it('Test createLogger', function () {
            var fields = {a: "1", b: "2"};
            logger.createLogger(fields);
            customFields.should.eql({a: "1", b: "2"});
        });

        it('Test logMessage', function () {
            var message = "testLevel";
            logger.logMessage(message);
            messageArgs.length.should.equal(1);
            messageArgs[0].should.equal("testLevel");
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

            logger.forceLogger("connect");
            logger.overrideNetworkField(field1, value1);
            field.should.equal(field1);
            value.should.equal(value1);
        });

        it('Test logNetwork', function () {
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

            logger.forceLogger("connect");

            obj1 = {};
            obj2 = {};
            obj3 = {};

            logger.logNetwork(obj1, obj2, obj3);
            req.should.equal(obj1);
            res.should.equal(obj2);
            next.should.equal(obj3);
        });

        it('Test winstonTransport', function () {
            var obj = logger.createWinstonTransport({level: "debug"});
            assert.typeOf(obj, "object");
            obj.constructor.name.should.equal("CfNodejsLoggingSupportLogger");
            obj.level.should.equal("debug");
        });

        it('Test setLogPattern' , function () {
            var pattern = "testing pattern {{msg}}";
            logger.setLogPattern(pattern);
            logPattern.should.equal(pattern);

            logger.forceLogger("restify");
            logger.setLogPattern(pattern + "restify");
            logPattern.should.equal(pattern + "restify");
            

            logger.forceLogger("plainhttp");
            logger.setLogPattern(pattern + "plain");
            logPattern.should.equal(pattern + "plain");

            logger.forceLogger("connect");
            logger.setLogPattern(pattern + "connect");
            logPattern.should.equal(pattern + "connect");
        });


        it('Test setCustomFields' , function () {
           logger.setCustomFields({a: "3", b: "4"});
           customFields.should.eql({a: "3", b: "4"});

           logger.setCustomFields({c: "5"});
           customFields.should.eql({c: "5"});

           logger.setCustomFields({});
           customFields.should.eql({});
        });

        it('Test registerCustomFields' , function () {
            logger.registerCustomFields({a: "3", b: "4"});
            registeredFields.should.eql({a: "3", b: "4"});
 
            logger.registerCustomFields({c: "5"});
            registeredFields.should.eql({c: "5"});
 
            logger.registerCustomFields({});
            registeredFields.should.eql({});
         });


    });
});