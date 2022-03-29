const expect = require('chai').expect;
const config = require('../../build/main/lib/config/config').default;

describe.skip('Test Config class', function () {
    var singleton = config.getInstance();

    describe('Test addConfig', function () {
        it('adds config files into config object', function () {
        });
    });

    describe('Test getConfig', function () {
        it('gets configuration', function () {
        });
    });

    describe('Test getDeactivatedFields', function () {
        it('gets deactivated fields', function () {
        });
    });

    describe('Test getFields', function () {
        it('gets all fields', function () {
        });
        it('gets specific fields', function () {
        });
    });

    describe('Test getMsgFields', function () {
        it('gets fields with output msg-log', function () {
        });
    });

    describe('Test getReqFields', function () {
        it('gets fields with output req-log', function () {
        });
    }); 

    describe('Test setCustomFieldsFormat', function () {
        it('sets custom fields format', function () {
        });
    });

    describe('Test setStartupMessageEnabled', function () {
        it('sets startup message', function () {
        });
    });
});
