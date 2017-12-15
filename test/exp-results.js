var os = require('os');

exports.getLogMessage = function () {
    var message = {
        "component_type": "application",
        "component_id": "-",
        "component_name": "-",
        "component_instance": "0",
        "source_instance": "0",
        "layer": "[NODEJS]",
        "space_name": "-",
        "space_id": "-",
        "container_id": "-",
        "logger": "nodejs-logger",
        "written_at": "1970-01-01T00:00:00.000Z",
        "written_ts": 12000000014,
        "correlation_id": "uuid-Dummy",
        "request_id": "-",
        "type": "request",
        "request": "",
        "referer": "-",
        "response_status": 200,
        "method": "GET",
        "response_size_b": -1,
        "request_size_b": -1,
        "remote_host": "-",
        "remote_port": "-",
        "remote_user": "-",
        "x_forwarded_for": "",
        "protocol": "HTTP",
        "remote_ip": "-",
        "response_content_type": "-",
        "request_received_at": "1970-01-01T00:00:00.000Z",
        "response_time_ms": 0,
        "direction": "IN",
        "response_sent_at": "1970-01-01T00:00:00.000Z",
        "msg": "testmessage",
        "level": "info"
    };
    return JSON.stringify(message) + os.EOL;

}