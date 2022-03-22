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
            result = log.getFields();
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

    describe('Get core fields', function () {
        beforeEach(function () {
            result = log.getCoreFields();
        });

        it('gets core configuration', function () {
            expect(result.length).to.be.gt(0);
        });

        it('gets only fields with output "log"', function () {
            const expectation = {
                "name": "component_id",
                "name": "component_id",
                "name": "component_name",
                "name": "component_instance",
                "name": "source_instance",
                "name": "layer",
                "name": "organization_name",
                "name": "organization_id",
                "name": "space_name",
                "name": "space_id",
                "name": "container_id",
                "name": "logger"
            };
            expect(result.join(", ")).to.contain(expectation);
        });
    });

    describe('Get deactivated fields', function () {
        beforeEach(function () {
            log.addConfig(customConfig);
            result = log.getDeactivatedFields();
        });

        it('gets configuration', function () {
            expect(result.length).to.be.gt(0);
        });

        it('gets only deactivated field', function () {
            const expectation = {
                "name": "deactivated_field"
            };
            expect(result[0]).to.contain(expectation);
        });
    });

    describe('Set custom fields format', function () {
        describe('using config file', function () {
            beforeEach(function () {
                log.addConfig(customConfig);
                result = log.getConfig();
            });

            it('sets format to cloud-logging', function () {
                expect(result.customFieldsFormat).to.be.eql("cloud-logging");
            });
        });
        describe('using api method', function () {
            beforeEach(function () {
                log.setFormat("cloud-logging");
                result = log.getConfig();
            });

            it('sets format to cloud-logging', function () {
                expect(result.customFieldsFormat).to.be.eql("cloud-logging");
            });
        });
    });

    describe('Set startup message', function () {
        describe('using config file', function () {
            beforeEach(function () {
                log.addConfig(customConfig);
                result = log.getConfig();
            });

            it('sets output startup msg from config-custom.json', function () {
                expect(result.outputStartupMsg).to.be.eql(false);
            });
        });
        describe('using convenience method', function () {
            beforeEach(function () {
                log.deactivateStartupMessage()
                result = log.getConfig();
            });

            it('sets output startup msg from config-custom.json', function () {
                expect(result.outputStartupMsg).to.be.eql(false);
            });
        });
    });
});
