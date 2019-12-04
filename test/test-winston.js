const { SPLAT } = require('triple-beam');
var rewire = require('rewire');
var chai = require("chai");
chai.should();


describe('Test winston-transport.js', function () {
    describe('Test parameter forwarding', function () {

        var transport;
        var logger = rewire("../index.js");
        var catchedArgs;

        before(function () {
            logger.__set__("coreLogger.logMessage", function() {
                catchedArgs = Array.prototype.slice.call(arguments);
            });

            transport = logger.createWinstonTransport();
        });

        after(function () {

        });

        it('Test log method (simple message)', function () {
           
            var info = {};
            info.level = "error";
            info.message = "test"

            var called = false;
            var callback = () => {called = true}

            transport.log(info, callback);

            catchedArgs.length.should.equal(2);
            catchedArgs[0].should.equal("error");
            catchedArgs[1].should.equal("test");
            called.should.equal(true)
        });

        it('Test log method (message with additional variables)', function () {
           
            var info = {};
            info.level = "error";
            info.message = "test %d %s"
            info[SPLAT] = [42, "abc"]

            var called = false;
            var callback = () => {called = true}

            transport.log(info, callback);

            catchedArgs.length.should.equal(4);
            catchedArgs[0].should.equal("error");
            catchedArgs[1].should.equal("test %d %s");
            catchedArgs[2].should.equal(42);
            catchedArgs[3].should.equal("abc");
            called.should.equal(true)
        });
    });

    describe('Test option initialization', function () {

        var logger = require("../index.js");

        it('Test default initialization', function () {
            var transport = logger.createWinstonTransport();
            transport.level.should.equal("info");
        });

        it('Test custom initialization', function () {
            var transport = logger.createWinstonTransport({level: "error"});
            transport.level.should.equal("error");
        });

        it('Test incomplete initialization', function () {
            var transport = logger.createWinstonTransport({});
            transport.level.should.equal("info");
        });
    });
});