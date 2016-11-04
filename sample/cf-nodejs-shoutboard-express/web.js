// Nodejs logging support sample app (express version)
var express = require("express");
var log = require("cf-nodejs-logging-support");
var redis = require("redis");
var app = express();
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

//Setting context
if (process.env.CONTEXT_ROOT) {
    var contextroot = '/' + process.env.CONTEXT_ROOT;
} else {
    var contextroot = '';
}

//sets the minimum logging level
log.setLoggingLevel("info");

//inserts the logger in the server network queue, so each time a https request is recieved, it is will get logged.
app.use(log.logNetwork);

app.use(contextroot + '/', express.static(__dirname + '/public'));

app.use(express.bodyParser());

//Setting CF Port
var port = Number(process.env.VCAP_APP_PORT || 8080);
app.listen(port, function () {
    log.logMessage('info', 'listening on port: %d', port);
});

//creates a json object and sends this as custom log with the given logger.
var stats = {};
stats.node_version = process.version;
log.logMessage('info', 'Runtime statistics', stats);


//handling post messages
app.post(contextroot + '/post_message', function (req, res) {
    console.log('POST Message: ');
    console.log(req.param("message"));
    var msg = {
        "name": req.param("name"),
        "time": req.param("time"),
        "message": req.param("message"),
        "timestamp": (new Date()).getTime()
    };
    if (redisRunning) {
        pub.publish('message', JSON.stringify(msg));
    } else {
        pushLocal(msg);
    }
    res.send({});
});

//handling post updates
app.post(contextroot + '/post_update', function (req, res) {
    //console.log('POST Update');

    var timestamp = req.param("start");
    var lastSync = req.param("lastSync");
    sendCumulativeMessages(timestamp, lastSync, res);
});

//get environment variables
app.get(contextroot + '/vcap_env', function (req, res) {
    console.log('VCAP ENV Information');
    res.send(JSON.stringify(process.env));
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
    if (syncPointer == -1) {
        syncPointer = messages.length;
    }
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
