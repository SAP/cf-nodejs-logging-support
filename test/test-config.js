const importFresh = require('import-fresh');
var chai = require("chai");
var sinon = require("sinon");
var assert = chai.assert;


chai.should();
describe('Test config', function () {

    var core = null;
    var index = null;
    var httpLogger;
    beforeEach(function () {
        // Set env vars to enable logging of sensitive data
        process.env.LOG_SENSITIVE_CONNECTION_DATA = true;
        process.env.LOG_REMOTE_USER = true;
        process.env.LOG_REFERER = true;
        process.env.LOG_SSL_HEADERS = true;

        core = importFresh("../core/log-core.js");
        httpLogger = importFresh("../logger/log-plainhttp.js");
        index = importFresh("../index.js");
        httpLogger.setCoreLogger(core);
        core.setConfig(importFresh("../config.js").config);
    });

    describe('Test logNetwork', function () {
        var fireLog = null;
        var logObject = null;
        var req = {};
        var res = {};
        var next;

        beforeEach(function () {
            core.sendLog = function (logObj) {
                logObject = logObj;
            };

            next = function () {};

            req = {};

            req.connection = {};
            req.headers = {};


            res = {};
            res.on = function (tag, func) {
                if (tag == 'finish') {
                    fireLog = func;
                }
            };

            res.get = function () {
                return null;
            };
        });

        it('Test anti-duplication mechanism', function () {
            var count = 0;

            core.sendLog = function () {
                count++;
            };

            httpLogger.logNetwork(req, res, next);
            fireLog();
            fireLog();

            count.should.equal(1);
        });

        it('Test x_forwarded_for', function () {
            req.headers = {};
            req.headers['x-forwarded-for'] = "test-host";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_for.should.equal("test-host");
        });

        it('Test x_custom_host', function () {
            req.headers = {};
            req.headers['x-custom-host'] = "test-host";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_custom_host.should.equal("test-host");
        });

        it('Test x_forwarded_host', function () {
            req.headers = {};
            req.headers['x-forwarded-host'] = "test-host";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_host.should.equal("test-host");
        });

        it('Test x_forwarded_proto', function () {
            req.headers = {};
            req.headers['x-forwarded-proto'] = "https";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_forwarded_proto.should.equal("https");
        });


        it('Test x_ssl_client', function () {
            req.headers = {};
            req.headers['x-ssl-client'] = "0";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client.should.equal("0");
        });

        it('Test x_ssl_client_verify', function () {
            req.headers = {};
            req.headers['x-ssl-client-verify'] = "0";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_verify.should.equal("0");
        });

        it('Test x_ssl_client_subject_dn', function () {
            req.headers = {};
            req.headers['x-ssl-client-subject-dn'] = "/C=FR/ST=Ile de France/L=Jouy en Josas/O=haproxy.com/CN=client1/emailAddress=ba@haproxy.com";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_subject_dn.should.equal("/C=FR/ST=Ile de France/L=Jouy en Josas/O=haproxy.com/CN=client1/emailAddress=ba@haproxy.com");
        });

        it('Test x_ssl_client_subject_cn', function () {
            req.headers = {};
            req.headers['x-ssl-client-subject-cn'] = "client1";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_subject_cn.should.equal("client1");
        });

        it('Test x_ssl_client_issuer_dn', function () {
            req.headers = {};
            req.headers['x-ssl-client-issuer-dn'] = "/C=FR/ST=Ile de France/L=Jouy en Josas/O=haproxy.com/CN=haproxy.com/emailAddress=ba@haproxy.com";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_issuer_dn.should.equal("/C=FR/ST=Ile de France/L=Jouy en Josas/O=haproxy.com/CN=haproxy.com/emailAddress=ba@haproxy.com");
        });

        it('Test x_ssl_client_notbefore', function () {
            req.headers = {};
            req.headers['x-ssl-client-notbefore'] = "130613144555Z";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_notbefore.should.equal("130613144555Z");
        });

        it('Test x_ssl_client_notafter', function () {
            req.headers = {};
            req.headers['x-ssl-client-notafter'] = "140613144555Z";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_notafter.should.equal("140613144555Z");
        });

        it('Test x_ssl_client_session_id', function () {
            req.headers = {};
            req.headers['x-ssl-client-session-id'] = "test-id";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.x_ssl_client_session_id.should.equal("test-id");
        });

        it('Test sap_passport', function () {
            var config = index.enableTracing("sap_passport")
            core.setConfig(config);
            req.headers = {};
            req.headers['sap-passport'] = "test-header";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.sap_passport.should.equal("test-header");
        });

        it('Test sap_passport with array', function () {
            var config = index.enableTracing(["SAP_passport"]);
            core.setConfig(config);
            req.headers = {};
            req.headers['sap-passport'] = "test-header";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.sap_passport.should.equal("test-header");
        });

        it('Test remote_user', function () {
            req.headers = {};
            req.user = {
                id: "test-user"
            };
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.remote_user.should.equal("test-user");
        });

        it('Test connection data propagation', function() {
            req.connection.remoteAddress  = "1.2.3.4";
            req.connection.remotePort = 8080;
            httpLogger.logNetwork(req, res, next);
            fireLog();
            logObject.remote_host.should.equal("1.2.3.4");
            logObject.remote_port.should.equal("8080");
        });
        
        it('Test correlation_id fallback', function () {
            req.headers["x-vcap-request-id"] = "test123";
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("test123");
            logObject.correlation_id.should.equal("test123");

        });
        
        
        it('Test HTTP header propagation', function () {
            req.httpVersion = "1.2";
            httpLogger.logNetwork(req, res, next);
            fireLog();
            logObject.protocol.should.equal("HTTP/1.2");

        });

        it('Test default values', function () {
            httpLogger.logNetwork(req, res, next);
            fireLog();

            logObject.request_id.should.equal("-");
            logObject.tenant_id.should.equal("-");
            logObject.request.should.equal("-");
            logObject.method.should.equal("-");
            logObject.request_size_b.should.equal(-1);
            logObject.remote_host.should.equal("-");
            logObject.response_size_b.should.equal(-1);
            logObject.response_content_type.should.equal("-");
            logObject.remote_port.should.equal("-");
            logObject.protocol.should.equal("HTTP");
            logObject.response_content_type.should.equal("-");
        });


    });
});