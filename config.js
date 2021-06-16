var uuid = require("uuid/v4");

var config = [
    {
        name: "component_type",
        mandatory: true,
        core: true,
        source: {
            type: "static",
            value: "application"
        }
    }, {
        name: "component_id",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "application_id"]
        },
        default: "-"
    }, {
        name: "component_name",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "application_name"]
        },
        default: "-"
    }, {
        name: "component_instance",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "instance_index"]
        },
        default: "0"
    }, {
        name: "source_instance",
        mandatory: false,
        core: true,
        source: {
            type: "self",
            name: "component_instance"
        }
    }, {
        name: "layer",
        mandatory: true,
        core: true,
        source: {
            type: "static",
            value: "[NODEJS]"
        }
    }, {
        name: "organization_name",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "organization_name"]
        },
        default: "-"
    }, {
        name: "organization_id",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "organization_id"]
        },
        default: "-"
    }, {
        name: "space_name",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "space_name"]
        },
        default: "-"
    }, {
        name: "space_id",
        mandatory: true,
        core: true,
        source: {
            type: "nested-env",
            path: ["VCAP_APPLICATION", "space_id"]
        },
        default: "-"
    }, {
        name: "container_id",
        mandatory: true,
        core: true,
        source: {
            type: "env",
            name: "CF_INSTANCE_IP"
        },
        default: "-"
    }, {
        name: "logger",
        mandatory: true,
        core: true,
        source: {
            type: "static",
            value: "nodejs-logger"
        }
    }, {
        name: "request_id",
        mandatory: true,
        source: {
            type: "header",
            name: "x-vcap-request-id"
        },
        default: "-"
    }, {
        name: "request_size_b",
        mandatory: true,
        source: {
            type: "header",
            name: "content-length"
        },
        default: -1
    }, {
        name: "type",
        mandatory: true,
        source: {
            type: "static",
            value: "request"
        }
    }, {
        name: "request",
        mandatory: true,
        source: {
            type: "field",
            name: "url"
        },
        default: "-"
    }, {
        name: "response_status",
        mandatory: true,
        source: {
            type: "field",
            parent: "res",
            name: "statusCode"
        },
        default: 200
    }, {
        name: "method",
        mandatory: true,
        source: {
            type: "field",
            name: "method"
        },
        default: "-"
    }, {
        name: "response_size_b",
        mandatory: true,
        source: {
            type: "header",
            parent: "res",
            name: "content-length"
        },
        default: -1
    }, {
        name: "response_content_type",
        mandatory: true,
        source: {
            type: "header",
            parent: "res",
            name: "content-type"
        },
        default: "-"

    }, {
        name: "remote_host",
        mandatory: true,
        envVarSwitch: "LOG_SENSITIVE_CONNECTION_DATA",
        source: {
            type: "special"
        },
        fallback: (req, res, logObj) => {
            return req.connection.remoteAddress == null ? "-" : req.connection.remoteAddress;
        }
    }, {
        name: "remote_port",
        mandatory: true,
        envVarSwitch: "LOG_SENSITIVE_CONNECTION_DATA",
        source: {
            type: "special"
        },
        fallback: (req, res, logObj) => {
            return req.connection.remotePort == null ? "-" : req.connection.remotePort.toString();
        }
    }, {
        name: "remote_user",
        mandatory: true,
        envVarSwitch: "LOG_REMOTE_USER",
        source: {
            type: "header",
            name: "remote-user"
        },
        default: "-"
    }, {
        name: "direction",
        mandatory: true,
        source: {
            type: "static",
            value: "IN"
        }
    }, {
        name: "x_forwarded_for",
        mandatory: true,
        envVarSwitch: "LOG_SENSITIVE_CONNECTION_DATA",
        source: {
            type: "header",
            name: "x-forwarded-for"
        },
        default: ""
    }, {
        name: "remote_ip",
        mandatory: false,
        envVarSwitch: "LOG_SENSITIVE_CONNECTION_DATA",
        source: {
            type: "self",
            name: "remote_host"
        }
    }, {
        name: "request_received_at",
        mandatory: false,
        source: {
            type: "self",
            name: "written_at"
        }
    }, {
        name: "protocol",
        mandatory: true,
        source: {
            type: "special"
        },
        fallback: (req, res, logObj) => {
            return "HTTP" + (req.httpVersion == null ? "" : "/" + req.httpVersion);
        }
    }, {
        name: "response_time_ms",
        mandatory: true,
        source: {
            type: "time",
            pre: () => {
                return Date.now();
            },
            post: (req, res, logObj) => {
                return Date.now() - logObj.response_time_ms;
            }
        }
    }, {
        name: "response_sent_at",
        mandatory: true,
        source: {
            type: "time",
            post: (req, res, logObj) => {
                return (new Date()).toJSON();
            }
        }
    }, {
        name: "referer",
        mandatory: true,
        envVarSwitch: "LOG_REFERER",
        source: {
            type: "header",
            name: "referer"
        },
        default: "-"
    }, {
        name: "correlation_id",
        mandatory: true,
        source: {
            type: "header",
            name: "x-correlationid"
        },
        fallback: (req, res, logObject) => {
            return (logObject.request_id != null && logObject.request_id != "-") ? logObject.request_id : uuid();
        }
    }, {
        name: "tenant_id",
        mandatory: true,
        source: {
            type: "header",
            name: "tenantid"
        },
        default: "-"
    }, {
        name: "tenant_subdomain",
        mandatory: true,
        source: {
            type: "static",
        },
        default: "-"
    }
];


exports.config = config;