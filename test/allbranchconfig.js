var config = [
    {
        name: "test_static",
        mandatory: true,
        source: {
            type: "static",
            value: "test-value-static"
        }
    },
    {
        name: "test_header_req",
        mandatory: true,
        source: {
            type: "header",
            name: "test-header-req"
        },
        default: "-"
    },
    {
        name: "test_header_res",
        mandatory: true,
        source: {
            type: "header",
            name: "test-header-res",
            parent: "res"
        },
        default: "-"
    },
    {
        name: "test_self_req",
        mandatory: true,
        source: {
            type: "self",
            name: "test_header_req"
        },
        default: "-"
    },
    {
        name: "test_self_res",
        mandatory: true,
        source: {
            type: "self",
            name: "test_header_res",
            parent: "res"
        },
        default: "-"
    },
    {
        name: "test_field_req",
        mandatory: true,
        source: {
            type: "field",
            name: "test-field"
        },
        default: "-"
    },
    {
        name: "test_field_res",
        mandatory: true,
        source: {
            type: "field",
            name: "test-field",
            parent: "res"
        },
        default: "-"
    },
    {
        name: "test_time",
        mandatory: true,
        source: {
            type: "time",
            pre: (req, res, logObj) => {
                return 1;
            },
            post: (req, res, logObj) => {
                return 2 + logObj.test_time;
            }
        }
    },
    {
        name: "test_special_req",
        mandatory: true,
        source: {
            type: "special"
        },
        fallback: (req, res, logObj) => {
            return "test-value-special-req";
        }
    },
    {
        name: "test_special_res",
        mandatory: true,
        source: {
            type: "special",
            parent: "res"
        },
        fallback: (req, res, logObj) => {
            return "test-value-special-res";
        }
    },
    {
        name: "test_defaults_req",
        mandatory: true,
        source: {
            type: "field",
            name: "not-existing-field",
        },
        default: "test-default-req"
    },
    {
        name: "test_defaults_res",
        mandatory: true,
        source: {
            type: "field",
            name: "not-existing-field",
        },
        default: "test-default-res"
    },
];


exports.config = config;