const expect = require('chai').expect;
const importFresh = require('import-fresh');
const customConfig = require('../config-test.json');
const config = importFresh('../../../build/main/lib/config/config').default;

describe('Test Config class', function () {
    var singleton = config.getInstance();
    var result;

    describe('Test getConfig', function () {
        beforeEach(function () {
            result = singleton.getConfig();
        });
        it('gets property fields', function () {
            expect(result).to.have.property("fields");
            expect(result.fields.length).be.eql(34);
        });
        it('gets property outputStartupMsg', function () {
            expect(result).to.have.property("outputStartupMsg", true);
        });
        it('gets property customFieldsFormat', function () {
            expect(result).to.have.property("customFieldsFormat", "cloud-logging");
        });
    });

    describe('Test getFields', function () {
        var result;
        describe('Get specific fields', function () {
            beforeEach(function () {
                result = singleton.getFields(['logger', "request"]);
            });
            it('gets 2 fields', function () {
                expect(result.length).to.be.eql(2);
            });
            it('gets specific fields', function () {
                let expectation = [
                    {
                        "name": "logger",
                        "mandatory": true,
                        "source": {
                            "type": "static",
                            "value": "nodejs-logger"
                        },
                        "output": [
                            "msg-log"
                        ]
                    }, {
                        "name": "request",
                        "mandatory": true,
                        "source": {
                            "type": "field",
                            "name": "originalUrl"
                        },
                        "output": [
                            "req-log"
                        ],
                        "default": "-"
                    }
                ];
                expect(result).to.be.eql(expectation);
            });
        })
        describe('Get all fields', function () {
            beforeEach(function () {
                result = singleton.getFields();
            });
            it('gets all fields', function () {
                expect(result.length).to.be.eql(34);
            });
        })
    });

    describe('Test getMsgFields', function () {
        beforeEach(function () {
            result = singleton.getMsgFields();
        });
        it('gets fields with output msg-log', function () {
            expectation = [{
                "name": "logger",
                "mandatory": true,
                "source": {
                    "type": "static",
                    "value": "nodejs-logger"
                },
                "output": [
                    "msg-log"
                ]
            }];
            expect(result.length).to.be.eql(1);
            expect(result).to.be.eql(expectation);
        });
    });

    describe('Test getReqFields', function () {
        beforeEach(function () {
            result = singleton.getReqFields();
        });
        it('gets fields with output req-log', function () {
            expect(result.length).to.be.eql(33);
        });
    });

    describe('Test setCustomFieldsFormat', function () {
        beforeEach(function () {
            singleton.setCustomFieldsFormat("application-logging");
            result = singleton.getConfig();
        });
        it('sets custom fields format', function () {
            expect(result).to.have.property("customFieldsFormat", "application-logging");
        });

        afterEach(function () {
            singleton.setCustomFieldsFormat("cloud-logging");
        })
    });

    describe('Test setStartupMessageEnabled', function () {
        beforeEach(function () {
            singleton.setStartupMessageEnabled(false);
            result = singleton.getConfig();
        });
        it('sets startup message', function () {
            expect(result).to.have.property("outputStartupMsg", false);
        });
        afterEach(function () {
            singleton.setStartupMessageEnabled(true);
        })
    });

    describe('Test addConfig', function () {
        beforeEach(function () {
            singleton.addConfig([customConfig]);
            fields = singleton.getFields();
            newFieldsData = singleton.getFields(["logger", "disabled_field", "new_field"]);
        });

        it('adds 2 new fields and overrides preexisting field', function () {
            expect(fields.length).to.be.eql(36);
        });

        it('adds new data correctly', function () {
            let expectation = [
                {
                    "name": "logger",
                    "mandatory": true,
                    "source": {
                        "type": "static",
                        "value": "TEST"
                    },
                    "output": [
                        "msg-log"
                    ]
                },
                {
                    "name": "disabled_field",
                    "mandatory": false,
                    "source": {
                        "type": "self",
                        "name": "component_instance"
                    },
                    "output": [
                        "msg-log"
                    ],
                    "disable": true
                },
                {
                    "name": "new_field",
                    "mandatory": false,
                    "source": {
                        "type": "self",
                        "name": "component_instance"
                    },
                    "output": [
                        "msg-log"
                    ]
                }
            ];
            expect(newFieldsData.length).to.be.gt(0);
            expect(newFieldsData).to.be.eql(expectation);
        });
    });

    describe('Test getDisabledFields', function () {
        beforeEach(function () {
            result = singleton.getDisabledFields();
        });
        it('gets disabled fields', function () {
            expectation = [{
                "name": "disabled_field",
                "mandatory": false,
                "source": {
                    "type": "self",
                    "name": "component_instance"
                },
                "output": [
                    "msg-log"
                ],
                "disable": true
            }];
            expect(result).to.be.eql(expectation);
        });
    });
});