var os = require('os');

exports.getLogMessage = function () {
    var message = {
        "component_type": "application",
        "component_id": "test-app-id",
        "component_name": "test-app-name",
        "component_instance": "7",
        "source_instance": "7",
        "layer": "[NODEJS]",
        "organization_id": "test-org-id",
        "organization_name": "test-org-name",
        "space_name": "test-space-name",
        "tenant_id": "-",
        "tenant_subdomain": "-",
        "space_id": "test-space-id",
        "container_id": "-",
        "logger": "nodejs-logger",
        "written_at": "2017-01-01T00:00:00.000Z",
        "written_ts": 1483228800000000000,
        "correlation_id": "test-correlation-id",
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
        "remote_user": "test-user",
        "x_forwarded_for": "",
        "protocol": "HTTP",
        "remote_ip": "-",
        "response_content_type": "-",
        "request_received_at": "2017-01-01T00:00:00.000Z",
        "response_time_ms": 0,
        "direction": "IN",
        "response_sent_at": "2017-01-01T00:00:00.000Z",
        "msg": "testmessage",
        "level": "info"
    };
    return message;

}