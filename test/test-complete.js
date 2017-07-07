var chai = require("chai");
var sinon = require("sinon");
var assert = chai.assert;
chai.should();

describe('Test log-express', function () {

    var should = {
        "written_at": "2017-07-07T09:40:15.961Z",
        "written_ts": 0,
        "component_type": "application",
        "component_id": "-",
        "component_name": "-",
        "component_instance": "0",
        "layer": "[NODEJS]",
        "space_name": "-",
        "space_id": "-",
        "source_instance": "0",
        "container_id": "-",
        "logger": "nodejs-logger",
        "msg": "listening on port: 3000",
        "type": "log",
        "level": "info"
    };
    var dummy = process.stdout.write;
    before(function () {
        var log = require("../index.js");
        const http = require('http');
        var fs = require('fs');
        var dump = fs.createWriteStream('version_2.log');
        var dummy = process.stdout.write;
        process.stdout.write = process.stderr.write = dump.write.bind(dump);

        //forces logger to run the http version.
        log.forceLogger("plainhttp");

        const server = http.createServer((req, res) => {
            //binds logging to the given request for request tracking
            log.logNetwork(req, res);

            // Context bound custom message
            req.logMessage("info", "request bound information:", {
                "some": "info"
            });
            res.end('ok');
        });
        server.listen(3000);
        // Formatted log message free of request context
        log.logMessage("info", "Server is listening on port %d", 3000);
    });
    
    beforeEach(() => {
        process.stdout.write = dummy;
    });
    
    it("testing complete", () => {
        console.log("tesd");
    });
});