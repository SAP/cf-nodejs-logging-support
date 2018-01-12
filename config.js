var uuid = require("uuid/v4");

var config = [{
    name: "request_id",
    mandatory: true,
    source: {
        type: "header",
        name: "x-vcap-request-id"
    },
    default: "-"
},{
    name: "request_size_b",
    mandatory: true,
    source: {
        type: "header",
        name: "content-length"
    },
    default: -1
},{
    name: "request_id",
    mandatory: true,
    source: {
        type: "header",
        name: "x-vcap-request-id"
    },
    default: "-"
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
        name: "originalUrl"
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
    source: {
        type: "special"
    },
    fallback: (req, res, logObj) => {
        return req.connection.remoteAddress == null ? "-" : req.connection.remoteAddress;
    }
}, {
    name: "remote_port",
    mandatory: true,
    source: {
        type: "special"
    },
    fallback: (req, res, logObj) => {
        return req.connection.remotePort == null ? "-" : req.connection.remotePort.toString();
    }
}, {
    name: "remote_user",
    mandatory: true,
    source: {
        type: "static",
        value: "-"
    }
},{
    name: "direction",
    mandatory: true,
    source: {
        type: "static",
        value: "IN"
    }
}, {
    name: "x_forwarded_for",
    mandatory: true,
    source: {
        type: "special"
    },
    fallback: (req, res, logObj) => {
        return req.headers['x-forwarded-for'] == null ? "" : req.headers['x-forwarded-for'];
    }
}, {
    name: "remote_ip",
    mandatory: false,
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
    source: {
        type: "static",
        value: "-"
    }
}, {
    name: "correlation_id",
    mandatory: true,
    source: {
        type: "header",
        name: "X-CorrelationID"
    },
    fallback: (req, res, logObject) => {
        return (logObject.request_id != null && logObject.request_id != "-") ? logObject.request_id : uuid();
    }
}];


exports.config = config;