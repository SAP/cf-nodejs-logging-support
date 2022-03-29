const expect = require('chai').expect;
const { before, after } = require('mocha');
const importFresh = require('import-fresh');
const supertest = require('supertest');
const expressApp = require("./express/app.js");
const restifyApp = require("./restify/app.js");
const connectApp = require("./connect/app.js");
const httpApp = require("./nodejs-http/app.js");

var lastLogs;

describe.skip('Test request context', function () {

    // catch logs written by supertest app
    process.writeLog = function (level, output) {
        lastLogs.push(JSON.parse(output));
    }

    before(function () {
        log = importFresh("../../../build/main/index");

        log.setSinkFunction(function (level, output) {
            process.writeLog(level, output);
        });
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

        it("writes a log with request_id and correlation_id", function () {
            expect(lastLogs[0]).to.have.property('request_id');
        });

        it("writes a log with tenant_id", function () {
            expect(lastLogs[0]).to.have.property('tenant_id');
        });

        it("writes a log with tenant_subdomain", function () {
            expect(lastLogs[0]).to.have.property('tenant_subdomain');
        });

        it('writes a log with all default request related properties', function () {
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

    describe("Set implicit correlation-, tenant-id and tenant-subdomain through methods", function () {

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

    describe("Get correlation-, tenant-id and tenant-subdomain", function () {

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

    describe("Test sensitive data redaction without activated env vars", function () {

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
                    .set('SAP-LOG-LEVEL', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXZlbCI6ImVycm9yIiwiZXhwIjoxNzc1NzMyMTQ2LCJpc3N1ZXIiOiJ0ZXN0LWVtYWlsQHNhcC5jb20iLCJpYXQiOjE2NDYxMzIxNDZ9.d-RgxVO7h2mvQZA7U49j9GsGXmCUn1WbKeYTc4_rVJ4uPS5RYBi_XesWny-NnQqzef2e4eeI_bZpVdjIVk-eZMnGmnnztLxamdIN5NhI2iTZ1X7taeVai3nsTgTtA1_eFsNNqbGMtxFyIe00VID42bfEkUCtYGph_ecvLTsHDWd5Vo94z_j4pCULqY_SQmkkOVrI0sK-N4qORlcFlPnyNHLKLz0aL6SEisiwtTvcIuKS2DJSvXkJz_6J0ok4FdrseXDmxxMtIqCrFXy1jHTFRfuRk2JNwgLD42nbg4b4O6R_TKpvK5Szl540o_qq9VMEQaZkV8F-I9LF279z3zYRYQ')
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
                    .set('SAP-LOG-LEVEL', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXZlbCI6ImRlYnVnIiwiZXhwIjoxNzc1NzQxNTE0LCJpc3N1ZXIiOiJ0ZXN0LWVtYWlsQHNhcC5jb20iLCJpYXQiOjE2NDYxNDE1MTR9.SJ-F3LrL4dbptw6y9t8wqpqMJgP8jVWGROwvUTg8mfNAopguHZXxn5A_nsknttT5TOREoqdope8ACz8OuvhLjYEWt-i8dt67DWheknOF47RW1NoOg_6s9t85CbIvquWSEZ_B0dhjNM4E6hTLschYNJN4AzuuFSdxqDVA8YAuaZi20CAjyWaVUa3syJhjS1dbyvFA8Aro9Tc1_h-amry1n5udgBHQw-U_K2_OVTmrHmHTw6v8UHuYcgnGS1_QWR_8aaaBvJ9kjrkTKZF9LvO-gdfw17jtwfv311HamXxV9_Tyr5gdJ5skHck8Aqq4Sm8V-o9i4oEqUklwsBSMW1jmZQ')
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

    describe("RESTIFY", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
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

    describe("CONNECT", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
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

    describe("NODEJSHTTP", function () {
        describe("Set implicit correlation- and tenant-id through request header", function () {

            var correlation_id = "cbc4343f-1c31-27d0-96fc-f32efac20986";
            var tenant_id = "abc2654f-5t15-12h0-78gt-n73jeuc01847";

            before(function (done) {
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
