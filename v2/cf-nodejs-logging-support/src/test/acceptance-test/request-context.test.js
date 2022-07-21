// saves public key
process.env.DYN_LOG_LEVEL_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2fzU8StO511QYoC+BZp4riR2eVQM8FPPB2mF4I78WBDzloAVTaz0Z7hkMog1rAy8+Xva+fLiMuxDmN7kQZKBc24O4VeKNjOt8ZtNhz3vlMTZrNQ7bi+j8TS8ycUgKqe4/hSmjJBfXoduZ8Ye90u8RRfPLzbuutctLfCnL/ZhEehqfilt1iQb/CRCEsJou5XahmvOO5Gt+9kTBmY+2rS/+HKKdAhI3OpxwvXXNi8m9LrdHosMD7fTUpLUgdcIp8k3ACp9wCIIxbv1ssDeWKy7bKePihTl7vJq6RkopS6GvhO6yiD1IAJF/iDOrwrJAWzanrtavUc1RJZvbOvD0DFFOwIDAQAB";
const expect = require('chai').expect;
const { before, after } = require('mocha');
const importFresh = require('import-fresh');
const supertest = require('supertest');
const expressApp = require("./express/app.js");
const restifyApp = require("./restify/app.js");
const connectApp = require("./connect/app.js");
const httpApp = require("./nodejs-http/app.js");
const log = importFresh("../../../build/main/index");

var lastLogs;

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

    describe("Express", function () {
        before(function () {
            log.forceLogger("express");
        });

        describe("Logs in request context", function () {

            before(function (done) {
                lastLogs = [];
                supertest(expressApp)
                    .get("/requestcontext")
                    .expect(200)
                    .then(
                        done()
                    )
                    .catch(err => done(err));
            });

            it("writes a log with a message", function () {
                expect(lastLogs.length).to.be.gt(0);
                expect(lastLogs[0]).to.have.property('msg', 'test-message');
            });

            it.skip("writes a log with request_id and correlation_id", function () {
                expect(lastLogs[0]).to.have.property('request_id');
            });

            it.skip("writes a log with tenant_id", function () {
                expect(lastLogs[0]).to.have.property('tenant_id');
            });

            it.skip("writes a log with tenant_subdomain", function () {
                expect(lastLogs[0]).to.have.property('tenant_subdomain');
            });

            it.skip('writes a log with all default request related properties', function () {
                const expectedKeys = [
                    'request_id',
                    'request_size_b',
                    'type',
                    'request',
                    'response_status',
                    'method',
                    'response_size_b',
                    'response_content_type',
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
                    'tenant_id',
                    'tenant_subdomain',
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
                    .then(
                        done()
                    )
                    .catch(err => done(err));

            });

            it("did not log", function () {
                expect(lastLogs.length).to.be.eql(0);
            });

            after(function () {
                lastLogs = [];
            });
        });

        describe.skip("Set implicit correlation-, tenant-id and tenant-subdomain through methods", function () {

            before(function (done) {
                supertest(expressApp)
                    .get("/setcorrelationandtenantid")
                    .expect(200)
                    .then(
                        done()
                    )
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
                    .then(
                        done()
                    )
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

        describe.skip("Get correlation-, tenant-id and tenant-subdomain", function () {

            before(function (done) {
                supertest(expressApp)
                    .get("/getcorrelationandtenantid")
                    .expect(200)
                    .then(
                        done()
                    )
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

        describe.skip("Test sensitive data redaction without activated env vars", function () {

            before(function (done) {
                supertest(expressApp)
                    .get("/requestcontext")
                    .expect(200)
                    .then(
                        done()
                    )
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
                expect(lastLogs[1]).to.have.property("referer", "-");
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

            describe("Set treshold to level error", function () {
                before(function (done) {
                    supertest(expressApp)
                        .get("/requestcontext")
                        .set('SAP-LOG-LEVEL', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXZlbCI6ImVycm9yIiwiZXhwIjoxNzgyOTgxNzg4LCJpc3N1ZXIiOiJpc3N1ZXJAc2FwLmNvbSIsImlhdCI6MTY1MzM4MTc4OH0.t3sHQMc5M8fch_U8WBFCCDyKS3D-1bj6hhft6MB1puXXHnzyTSQDz8oAbgkCpSiUOxRzE3GpRiMpMZEFCm4cvl2xy2TCxERzBBTQBxON_Au7_ggzJUtxrGkuurxWBMf7hjWWxMP2p3DkJvVD8gpM4VphJKwIto0WDJIcdqTtkFM4wruPAEn-nNlyAZCp3GYOcYMtqv3dz1ShckB8uF6KCs_dv238DMI_6q0Y9HtXW_o4gParTL20vDB9IIibpJ3JsKJu2LlZJ6dSkR0iAwqXSTjiXGpMIz3P82URKekTGABxumqHE1Jgl3Kdlquu5r6OvEgwqeMh8oui2ZofLiVe-Q')
                        .expect(200)
                        .then(
                            done()
                        )
                        .catch(err => done(err));
                });

                it("did not log in level info", function () {
                    expect(lastLogs.length).to.be.eql(0);
                });
            });

            describe("Set treshold to level debug", function () {
                before(function (done) {
                    supertest(expressApp)
                        .get("/requestcontext")
                        .set('SAP-LOG-LEVEL', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXZlbCI6ImRlYnVnIiwiZXhwIjoxNzgyOTgyMDk0LCJpc3N1ZXIiOiJpc3N1ZXJAc2FwLmNvbSIsImlhdCI6MTY1MzM4MjA5NH0.c2TsfootLMbGNKoLmsaffINnyE-Vd-UQuOMvDLaQnkFdlSlp67fl327XL2Ttsc_JDse-YROqWcSMucohrLtcabE8MTcVTq_VeIIG_nGQ9WqKsDg1XXzJvFi5VdFAMcHdSgBnrcDSarRNn2kA6Hjcx7sT8aCCrHQRdtGyUVr4t20AHNpwTapKZvrfI7MjtQYDr4KywjoCojRklaUWSvoDn-iLIoZ-kbJLmQyxK5lvpjhvw-Ip8jRQAheyq04wp6CW0mMzWkvqdMIWciUQ_hh2RBg84s1An-kXIKq5Yju0zsDLQ8UPmJWfcNUZ4ACsaZO2WA3xytD4kY6KF_fpZVgVcA')
                        .expect(200)
                        .then(
                            done()
                        )
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

    describe.skip("RESTIFY", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                log.forceLogger("restify");
                supertest(restifyApp)
                    .get("/log")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(
                        done()
                    )
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
                supertest(restifyApp)
                    .get("/setcorrelationandtenantid")
                    .expect(200)
                    .then(
                        done()
                    )
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
                supertest(restifyApp)
                    .get("/getcorrelationandtenantid")
                    .expect(200)
                    .then(
                        done()
                    )
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

    describe.skip("CONNECT", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                log.forceLogger("connect");
                supertest(connectApp)
                    .get("/log")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(
                        done()
                    )
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
                    .then(
                        done()
                    )
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
                    .then(
                        done()
                    )
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

    describe.skip("NODEJSHTTP", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
                log.forceLogger("plainhttp");
                supertest(httpApp)
                    .get("/")
                    .set("x-correlationid", correlation_id)
                    .set("tenantid", tenant_id)
                    .expect(200)
                    .then(
                        done()
                    )
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
                    .then(
                        done()
                    )
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
                    .then(
                        done()
                    )
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
