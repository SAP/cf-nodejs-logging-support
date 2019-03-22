// Nodejs logging support sample app (restify version)
var restify = require("restify");
var log = require("cf-nodejs-logging-support");
var redis = require("redis");
var app = restify.createServer();
var redisRunning = false;
var syncPointer = -1;
var lastSync = 0;

var messages = [];
var pub = redis.createClient();
var sub = redis.createClient();

// setup redis publisher and subscriber
sub.subscribe("message", "sync");
pub.on("connect", redisConnectionHandler);
sub.on("connect", redisConnectionHandler);
pub.on("end", redisEndHandler);
sub.on("end", redisEndHandler);
pub.on("error", redisErrorHandler);
sub.on("error", redisErrorHandler);

// force logger to run restify version. (default is express, forcing express is also legal)
log.forceLogger("restify");

// set the minimum logging level
log.setLoggingLevel("info");

// setup serving of static files
app.get("/*", restify.plugins.serveStatic({
    directory: "./public",
    default: "index.html"
}));

// insert the logger as middleware to log each request.
app.use(log.logNetwork);

// parse body json params
app.use(restify.plugins.bodyParser({ mapParams: true }));

// setup CF port
var port = Number(process.env.VCAP_APP_PORT || 8080);
app.listen(port, function () {
    //write a message using the logMessage method of the logger.
    log.logMessage("info", "listening on port: %d", port);
});


// create a json object and send it as custom log with the given logger.
var stats = {};
stats.node_version = process.version;
log.logMessage("info", "Runtime statistics", stats);

// handling post messages
app.post("/post_message", function (req, res, next) {
    var msg = {
        "name": req.body.name,
        "time": req.body.time,
        "message": req.body.message,
        "timestamp": (new Date()).getTime()
    };

    req.logMessage("info", `received message from '${msg.name}': ${msg.message}`);

    if (redisRunning) {
        pub.publish("message", JSON.stringify(msg));
    } else {
        pushLocal(msg);
    }
    res.send({});
    return next();
});

// handling post updates
app.post("/post_update", function (req, res, next) {
    console.log(req);
    var timestamp = req.body.start;
    var lastSync = req.body.lastSync;
    sendCumulativeMessages(timestamp, lastSync, res);
    return next();
});

// handle received messages from redis, for synchronization between servers
sub.on("message", function (channel, message) {
    var data = JSON.parse(message);
    if (data.data != null) {
        mergeMessages(data.data);

    } else {
        messages.push(data);
    }
});

// merge messages from different servers after redis restart
function mergeMessages(data) {
    lastSync = (new Date()).getTime();
    reconnect = true;
    if (messages.length == 0) {
        messages = data;
    } else {
        var i = data.length - 1;
        var j = messages.length - 1;
        while (i >= 0 && j >= 0) {
            if (data[i].timestamp < messages[j].timestamp) {
                j--;
            } else {
                messages.splice(j + 1, 0, data[i--]);
            }
        }
    }
}

// push messages to local backup storages during redis free periods (can as well serve as permanent redis free pushing option)
function pushLocal(data) {
    if (syncPointer == -1)
        syncPointer = messages.length;
    messages.push(data);
}

// send all missing messages to client, or resends some messages after redis restart
function sendCumulativeMessages(timestamp, clientSync, res) {
    if (timestamp == null) timestamp = 0;
    if (clientSync == null) clientSync = 0;
    var data = getCumulativeMessages(timestamp, clientSync);
    res.send(data);
}

// get the requested messages from message storage system
function getCumulativeMessages(timestamp, clientSync) {
    var msgs = [];
    if (lastSync > clientSync) {
        msgs = messages;
    } else {
        var newMsgs = messages.length;
        while (newMsgs > 0 && messages[newMsgs - 1].timestamp > timestamp) {
            newMsgs--;
        }
        for (var i = newMsgs; i < messages.length; i++) {
            msgs.push(messages[i]);
        }
    }

    var data = {};
    data.msgs = msgs;
    data.lastSync = lastSync;

    return data;
}

// handle redis error 
function redisErrorHandler(err) {
    if (redisRunning) {
        log.logMessage("error", "redis error occured!");
    }
    redisRunning = false;
}

// handle redis end 
function redisEndHandler(err) {
    if (redisRunning) {
        log.logMessage("info", "redis disconnected!");
    }
    redisRunning = false;
}

// handle redis connect
function redisConnectionHandler() {
    if (!redisRunning) {
        log.logMessage("info", "redis connected!");
    }
    redisRunning = true;
    sub.subscribe("message", "sync");
    synchronize();
}


// synchronize messages after redis reconnect between server instances
function synchronize() {
    if (syncPointer != -1) {
        log.logMessage("verbose", "redis synchronization!");
        var syncMessage = {};
        syncMessage.data = messages.splice(syncPointer, messages.length - syncPointer);
        setTimeout(function () {
            pub.publish("message", JSON.stringify(syncMessage));
        }, 200);
        syncPointer = -1;
    }
}
