const expect = require('chai').expect;
const importFresh = require('import-fresh');
const customConfig = require('./config-custom.json');

describe('Test configuration', function () {

    console.log(customConfig);

    var result;

    beforeEach(function () {
        log = importFresh("../../build/main/index");
    });

    describe('Add custom configuration', function () {
        beforeEach(function () {
            log.addConfig(customConfig);
            result = log.getConfig();
        });

        it('gets configuration', function () {
            expect(result.length).to.be.gt(0);
        });

        it('overrides existing field', function () {
            expect(result[0].source).to.have.property("value", "TEST");
        });

        it('adds new field', function () {
            const index = (result.length - 1);
            expect(result[index]).to.have.property("name", "new_field");
        });
    });
});
