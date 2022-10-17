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
            expect(result.fields.length).be.eql(36);
        });
        it('gets property outputStartupMsg', function () {
            expect(result).to.have.property("outputStartupMsg", true);
        });
        it('gets property customFieldsFormat', function () {
            expect(result).to.have.property("customFieldsFormat", "cloud-logging");
        });
    });

    describe('Test getConfigFields', function () {
        var result;
        describe('Get specific fields', function () {
            beforeEach(function () {
                result = singleton.getConfigFields(['logger', "request"]);
            });
            it('gets 2 fields', function () {
                expect(result.length).to.be.eql(2);
            });
            it('gets specific fields', function () {
                let expectation = [
                    {
                        "name": "logger",
                        "source": {
                            "type": "static",
                            "value": "nodejs-logger"
                        },
                        "output": [
                            "msg-log",
                            "req-log"
                        ],
                        "_meta": {
                            "isEnabled": true,
                            "isRedacted": false,
                            "isCache": true,
                            "isContext": false
                        }
                    }, {
                        "name": "request",
                        "source": {
                            "type": "req-object",
                            "name": "originalUrl"
                        },
                        "output": [
                            "req-log"
                        ],
                        "_meta": {
                            "isEnabled": true,
                            "isRedacted": false,
                            "isCache": false,
                            "isContext": false
                        }
                    }
                ];
                expect(result).to.be.eql(expectation);
            });
        })
        describe('Get all fields', function () {
            beforeEach(function () {
                result = singleton.getConfigFields();
            });
            it('gets all fields', function () {
                expect(result.length).to.be.eql(36);
            });
        })
    });

    describe('Test setCustomFieldsFormat', function () {
        beforeEach(function () {
            singleton.setCustomFieldsFormat("application-logs");
            result = singleton.getConfig();
        });
        it('sets custom fields format', function () {
            expect(result).to.have.property("customFieldsFormat", "application-logs");
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
            fields = singleton.getConfigFields();
            newFieldsData = singleton.getConfigFields(["logger", "disabled_field", "uuid_field", "new_field"]);
        });

        it('adds 2 new fields and overrides preexisting field', function () {
            expect(fields.length).to.be.eql(40);
        });

        it('adds new data correctly', function () {
            let expectation = [
                {
                    "name": "logger",
                    "source": {
                        "type": "static",
                        "value": "TEST"
                    },
                    "output": [
                        "msg-log",
                        "req-log"
                    ],
                    "_meta": {
                        "isEnabled": true,
                        "isRedacted": false,
                        "isCache": true,
                        "isContext": false
                    }
                },
                {
                    "name": "disabled_field",
                    "source": {
                        "type": "config-field",
                        "name": "component_instance"
                    },
                    "output": [
                        "msg-log"
                    ],
                    "disable": true,
                    "_meta": {
                        "isEnabled": false,
                        "isRedacted": false,
                        "isCache": false,
                        "isContext": false
                    }
                },
                {
                    "name": "uuid_field",
                    "source": {
                        "type": "static",
                        "value": "8888c6e8-f44e-4a33-a444-1eadd1234567",
                        "regExp": "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}"
                    },
                    "output": [
                        "msg-log",
                        "req-log"
                    ],
                    "_meta": {
                        "isEnabled": true,
                        "isRedacted": false,
                        "isCache": true,
                        "isContext": false
                    }
                },
                {
                    "name": "new_field",
                    "source": {
                        "type": "config-field",
                        "name": "component_instance"
                    },
                    "output": [
                        "msg-log"
                    ],
                    "_meta": {
                        "isEnabled": true,
                        "isRedacted": false,
                        "isCache": false,
                        "isContext": false
                    }
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
                "source": {
                    "type": "config-field",
                    "name": "component_instance"
                },
                "output": [
                    "msg-log"
                ],
                "_meta": {
                    "isEnabled": false,
                    "isRedacted": false,
                    "isCache": false,
                    "isContext": false
                },
                "disable": true
            }];
            expect(result).to.be.eql(expectation);
        });
    });
});
