// Nodejs logging support sample app (restify version)
var restify = require("restify");
var log = require("cf-nodejs-logging-support");
var redis = require("redis");
var app = restify.createServer();
var redisRunning = true;
var reconnect = false;
var syncPointer = -1;
var lastSync = 0;

var messages = [];
var pub = redis.createClient();
var sub = redis.createClient();
sub.subscribe('message', 'sync');
pub.on("connect", redisConnectionHandler);
sub.on("connect", redisConnectionHandler);
pub.on("error", redisErrorHandler);
sub.on("error", redisErrorHandler);

//forces logger to run the restify version. (default is express, forcing express is also legal)
log.forceLogger("restify");

//sets the minimum logging level
log.setLoggingLevel("info");

//insert the logger in the server network queue, so each time a https request is recieved, it is will get logged.
app.use(log.logNetwork);

//Setting context
app.get(/.*/, restify.serveStatic({
    directory: __dirname + "/public",
    default: 'index.html'
}));

app.use(restify.bodyParser());

//Setting CF Port
var port = Number(process.env.VCAP_APP_PORT || 5000 + parseInt(100 * Math.random()));
app.listen(port, function () {
    //writes the port as message with the logMessage method of the given logger.
    log.logMessage('info', 'listening on port: %d', port);
});


//creates a json object and sends this as custom log with the given logger.
var stats = {};
stats.node_version = process.version;
log.logMessage('info', 'Runtime statistics', stats);

//handling post messages
app.post(/\/post_message/, function (req, res) {
    console.log('POST Message: ');
    console.log(req.body.message);
    var msg = {
        "name": req.body.name,
        "time": req.body.time,
        "message": req.body.message,
        "timestamp": (new Date()).getTime()
    };

    var startTimestamp = req.body.start;
    if (redisRunning) {
        pub.publish('message', JSON.stringify(msg));
    } else {
        pushLocal(msg);
    }
    res.send({});
    return next();
});

//handling post updates
app.post(/\/post_update/, function (req, res) {
    //console.log('POST Update');

    var timestamp = req.body.start;
    var lastSync = req.body.lastSync;
    sendCumulativeMessages(timestamp, lastSync, res);
    return next();
});

//get environment variables
app.get(/\/vcap_env/, function (req, res) {
    console.log('VCAP ENV Information');
    res.send(JSON.stringify(process.env));
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

//merges messages from different servers after redis restart
function mergeMessages(data) {
    lastSync = (new Date()).getTime();
    reconnect = true;
    console.log(data);
    if (messages.length == 0) {
        messages = data;
    } else {
        var i = data.length - 1;
        var j = messages.length - 1;
        console.log(i);
        while (i >= 0 && j >= 0) {
            if (data[i].timestamp < messages[j].timestamp) {
                j--;
            } else {
                messages.splice(j + 1, 0, data[i--]);
            }
        }
    }
}

//pushes messages to local backup storages during redis free periods (can as well serve as permanent redis free pushing option)
function pushLocal(data) {
    if (syncPointer == -1)
        syncPointer = messages.length;
    messages.push(data);
}

//sends all messages to client it is missing, or resends some messages after redis restart
function sendCumulativeMessages(timestamp, clientSync, res) {

    if (timestamp == null) timestamp = 0;
    if (clientSync == null) clientSync = 0;
    var data = getCumulativeMessages(timestamp, clientSync);
    res.send(data);
}

//gets the needed messages from message storage system
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

//handles redis disconnect 
function redisErrorHandler(err) {
    //console.log(err);
    if (redisRunning) {
        log.logMessage('info', 'redis is not running!');
    }
    redisRunning = false;
}

//handles redis reconnection
function redisConnectionHandler() {
    if (!redisRunning) {
        log.logMessage('info', 'redis reconnected!');
    }
    redisRunning = true;
    sub.subscribe('message', 'sync');
    synchronize();
}

//synchronizes messages after redis reconnect between server Instances
function synchronize() {
    if (syncPointer != -1) {
        log.logMessage('verbose', 'redis synchronization!');
        var syncMessage = {};
        syncMessage.data = messages.splice(syncPointer, messages.length - syncPointer);
        setTimeout(function () {

            pub.publish("message", JSON.stringify(syncMessage));
        }, 200);
        syncPointer = -1;
    }
}
