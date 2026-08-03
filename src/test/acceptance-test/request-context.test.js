const expect = require('chai').expect;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { before, after } = require('mocha');
const importFresh = require('import-fresh');
const { BUILD_CJS_INDEX } = require('../paths');
const supertest = require('supertest');
const expressApp = require("./express/app.js");
const connectApp = require("./connect/app.js");
const fastifyApp = require("./fastify/app.js");
const httpApp = require("./nodejs-http/app.js");
const log = importFresh(BUILD_CJS_INDEX);

var lastLogs = [];

describe('Test request context', function () {
    // catch logs written by supertest app
    process.writeLog = function (level, output) {
        lastLogs.push(JSON.parse(output));
    }

    before(function () {
        log.setSinkFunction(function (level, output) {
            process.writeLog(level, output);
        });
    });

    describe("Use Express framework", function () {
        before(function () {
            log.setFramework("express");
        });

        describe("Logs in request context", function () {
            before(function (done) {
                lastLogs = [];
                supertest(expressApp)
                    .get("/requestcontext")
                    .set({ "x-vcap-request-id": "1234", "tenantid": "1234" })
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("writes a log with a message", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'test-message');
            });

            it("writes a log with request_id and correlation_id", function () {
                expect(lastLogs[0]).to.have.property('request_id');
            });

            it("writes a log with tenant_id", function () {
                expect(lastLogs[0]).to.have.property('tenant_id');
            });

            it("writes a log with tenant_subdomain", function () {
                expect(lastLogs[0]).to.not.have.property('tenant_subdomain');
            });

            it('writes a log with all default request related properties', function () {
                const expectedKeys = [
                    'request_id',
                    'type',
                    'request',
                    'response_status',
                    'method',
                    'remote_host',
                    'remote_port',
                    'remote_user',
                    'direction',
                    'remote_ip',
                    'request_received_at',
                    'protocol',
                    'response_time_ms',
                    'response_sent_at',
                    'referer',
                    'correlation_id',
                    'tenant_id'
                ];
                expect(lastLogs[1]).to.include.all.keys(expectedKeys);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set log level treshold in request handler", function () {
            before(function (done) {
                lastLogs = [];
                supertest(expressApp)
                    .get("/setloglevel")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));

            });

            it("did not log", function () {
                expect(lastLogs.length).to.be.eql(0);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set implicit correlation-, tenant-id and tenant-subdomain through methods", function () {
            before(function (done) {
                supertest(expressApp)
                    .get("/setcorrelationandtenantid")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("writes a log with correlation id", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', 'cbc2654f-1c35-45d0-96fc-f32efac20986');
            });

            it("writes a log with tenant id", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', 'abc2654f-5t15-12h0-78gt-n73jeuc01847');
            });

            it("writes a log with tenant subdomain", function () {
                expect(lastLogs[1]).to.have.property('tenant_subdomain', 'test-subdomain');
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set implicit correlation- and tenant-id through request header", function () {
            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                supertest(expressApp)
                    .get("/simplelog")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("sets correlation_id via header", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Get correlation-, tenant-id and tenant-subdomain", function () {
            before(function (done) {
                supertest(expressApp)
                    .get("/getcorrelationandtenantid")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("get methods returned expected values", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'successful');
            });


            after(function () {
                lastLogs = [];
            });
        });

        describe("Test sensitive data redaction without activated env vars", function () {
            before(function (done) {
                supertest(expressApp)
                    .get("/requestcontext")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("writes a log with redacted sensitive connection data properties", function () {
                const expectation = {
                    "remote_ip": "redacted",
                    "remote_host": "redacted",
                    "remote_port": "redacted",
                };
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.contain(expectation);
            });

            it("writes a log with default remote_user", function () {
                expect(lastLogs[1]).to.have.property("remote_user", "redacted");
            });

            it("writes a log with default referer", function () {
                expect(lastLogs[1]).to.have.property("referer", "redacted");
            });

            it("writes a log without x_ssl_* properties", function () {
                expectation = [
                    "x_ssl_client",
                    "x_ssl_client_verify",
                    "x_ssl_client_subject_dn",
                    "x_ssl_client_subject_cn",
                    "x_ssl_client_issuer_dn",
                    "x_ssl_client_notbefore",
                    "x_ssl_client_notafter",
                    "x_ssl_client_session_id",
                ]
                expect(lastLogs[1]).to.not.contain.all.keys(expectation);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set dynamic log level with JWT", function () {
            var privateKey;

            before(function () {
                const keyPair = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 2048,
                    publicKeyEncoding: { type: 'spki', format: 'pem' },
                    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
                });
                privateKey = keyPair.privateKey;
                const pubKeyBase64 = keyPair.publicKey
                    .replace('-----BEGIN PUBLIC KEY-----', '')
                    .replace('-----END PUBLIC KEY-----', '')
                    .replace(/\n/g, '');
                process.env.DYN_LOG_LEVEL_KEY = pubKeyBase64;
            });

            after(function () {
                delete process.env.DYN_LOG_LEVEL_KEY;
            });

            describe("Set treshold to level error", function () {
                before(function (done) {
                    const token = jwt.sign({ level: 'error', issuer: 'issuer@sap.com' }, privateKey, { algorithm: 'RS256', expiresIn: '1d' });
                    supertest(expressApp)
                        .get("/requestcontext")
                        .set('SAP-LOG-LEVEL', token)
                        .expect(200)
                        .then(() => done())
                        .catch(err => done(err));
                });

                it("did not log in level info", function () {
                    expect(lastLogs.length).to.be.eql(0);
                });
            });

            describe("Set treshold to level debug", function () {
                before(function (done) {
                    const token = jwt.sign({ level: 'debug', issuer: 'issuer@sap.com' }, privateKey, { algorithm: 'RS256', expiresIn: '1d' });
                    supertest(expressApp)
                        .get("/requestcontext")
                        .set('SAP-LOG-LEVEL', token)
                        .expect(200)
                        .then(() => done())
                        .catch(err => done(err));
                });

                it("did log in level debug", function () {
                    expect(lastLogs.length).to.be.gt(0);
                    expect(lastLogs[0]).to.have.property('msg', 'debug-message');
                });

                after(function () {
                    lastLogs = [];
                });
            });
        });
    })

    describe("Use Connect framework", function () {
        before(function (done) {
            log.setFramework("connect");
            done();
        });

        describe("Set implicit correlation- and tenant-id through request header", function () {
            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                supertest(connectApp)
                    .get("/log")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("sets correlation_id via header", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });

        });

        describe("Set implicit correlation- and tenant-id through methods", function () {
            var correlation_id = "cbc2654f-1c35-45d0-96fc-f32efac20986";
            var tenant_id = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                supertest(connectApp)
                    .get("/setcorrelationandtenantid")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("writes a log with correlation id", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });

        });

        describe("Get correlation- and tenant-id", function () {
            before(function (done) {
                supertest(connectApp)
                    .get("/getcorrelationandtenantid")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("get methods returned expected values", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'successful');
            });


            after(function () {
                lastLogs = [];
            });
        });
    });

    describe("Use Fastify framework", function () {
        before(function (done) {
            log.setFramework("fastify");
            done();
        });

        describe("Set implicit correlation- and tenant-id through request header", function () {
            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                fastifyApp.ready().then(() => {
                    supertest(fastifyApp.server)
                        .get("/log")
                        .set("x-correlationid", correlation_id)
                        .set("tenantid", tenant_id)
                        .expect(200)
                        .then(() => done())
                        .catch(err => done(err));
                })
            });

            it("sets correlation_id via header", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set implicit correlation- and tenant-id through methods", function () {
            var correlation_id = "cbc2654f-1c35-45d0-96fc-f32efac20986";
            var tenant_id = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                fastifyApp.ready().then(() => {
                    supertest(fastifyApp.server)
                        .get("/setcorrelationandtenantid")
                        .expect(200)
                        .then(() => done())
                        .catch(err => done(err));
                })
            });

            it("writes a log with correlation id", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Get correlation- and tenant-id", function () {
            before(function (done) {
                fastifyApp.ready().then(() => {
                    supertest(fastifyApp.server)
                        .get("/getcorrelationandtenantid")
                        .expect(200)
                        .then(() => done())
                        .catch(err => done(err));
                })
            });

            it("get methods returned expected values", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'successful');
            });


            after(function () {
                lastLogs = [];
            });
        });
    });

    describe("Use Node.js http", function () {
        before(function (done) {
            log.setFramework("plainhttp");
            done();
        });

        describe("Set implicit correlation- and tenant-id through request header", function () {
            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                supertest(httpApp)
                    .get("/")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("sets correlation_id via header", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Set implicit correlation- and tenant-id through methods", function () {
            var correlation_id = "cbc2654f-1c35-45d0-96fc-f32efac20986";
            var tenant_id = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                supertest(httpApp)
                    .get("/setcorrelationandtenantid")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("writes a log with correlation id", function () {
                expect(lastLogs.length).to.be.gt(1);
                expect(lastLogs[1]).to.have.property('correlation_id', correlation_id);
            });

            it("sets tenant_id via header", function () {
                expect(lastLogs[1]).to.have.property('tenant_id', tenant_id);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe("Get correlation- and tenant-id", function () {

            before(function (done) {
                supertest(httpApp)
                    .get("/testget")
                    .expect(200)
                    .then(() => done())
                    .catch(err => done(err));
            });

            it("get methods returned expected values", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'successful');
            });


            after(function () {
                lastLogs = [];
            });
        });
    });

    after(function () {
        log.setLoggingLevel("info");
    })
});
