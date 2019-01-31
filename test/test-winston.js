const importFresh = require('import-fresh');
var chai = require("chai");
var logger = importFresh("../index.js");
var sinon = require("sinon");
var assert = chai.assert;
var should = chai.should();
var Module = require('module');
var rewire = require('rewire');


describe('Test winston.js', function () {
    describe('Test functionality', function () {

        var obj;
        before(function () {
            obj = logger.createWinstonTransport();
            clock = sinon.useFakeTimers();
        });
        after(function () {
            clock.restore();
        });

        it('Test loglevel defined logging', function () {
           
            var info = {};
            info.level = "error";
            info.message = "test"

            obj.log(info);

          /*  var jsonObj = JSON.parse(obj.formatter(options));
            assert.property(jsonObj, "level");
            jsonObj.level.should.equal("info");*/
        });
    });

    describe('Test correct missing fallback', function () {

        var origRequire = Module.prototype.require;
        before(function () {
            Module.prototype.require = function () {
            var args = Array.prototype.slice.call(arguments);
                if (args[0] === "winston") {
                    throw "error";
                }
                return origRequire.apply(this, arguments);
            }
            logger = rewire("../index.js");
        });
        after(function () {
            Module.prototype.require = origRequire;
        });

        it('Test correct empty object', function () {
            obj = logger.winstonTransport;
            assert.isNull(obj);
        });
    });
});