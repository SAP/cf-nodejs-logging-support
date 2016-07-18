var chai = require("chai");
var logger = require("../index.js");
var sinon = require("sinon");
var assert = chai.assert;
var should = chai.should();

describe('Test winston.js', function () {
    describe('Test functionality', function () {

        var obj;
        before(function () {
            obj = logger.winstonTransport;
            clock = sinon.useFakeTimers();
        });
        after(function () {
            clock.restore();
        });

        it('Test timestamp: ', function () {
            obj.timestamp().should.equal(0);
        });

        it('Test formatter with bad values: ', function () {
            assert.typeOf(obj.formatter(), "string");
            assert.typeOf(obj.formatter(""), "string");
            assert.typeOf(obj.formatter({}), "string");
        });

        it('Test formatter with string: ', function () {
            var options = {};
            options.message = "hallo";
            assert.typeOf(obj.formatter(options), "string");
        });

        it('Test formatter with object: ', function () {
            var options = {};
            options.meta = {
                "hallo": "ich"
            };
            options.message = "hallo";
            assert.typeOf(obj.formatter(options), "string");

        });
    });
});
