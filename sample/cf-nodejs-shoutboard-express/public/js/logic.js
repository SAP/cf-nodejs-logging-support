$(document).ready(function () {
    var lastMessageTimestamp = 0;
    var lastFullSync = 0;
    var autoUpdate = false;
    var updateInterval;

    var $document = $(document);
    $document.on("keydown", "#input-field", function (e) {
        var msg = $(this).val();
        var name = $("#name-field").val();
        if (e.which == 13) {
            sendMessage(msg, name);
        }
    });

    $document.on("click", "#bt-send", function () {
        var msg = $("#input-field").val();
        var name = $("#name-field").val();
        sendMessage(msg, name);
    });

    $document.on("click", "#bt-update", function () {
        sendUpdate();
    });

    $document.ready(function () {
        sendUpdate();
    });

    $document.on("click", "#bt-menu", function () {
        $("#headline-controls").toggleClass("open");
    });

    $document.on("click", "#bt-auto-update", function () {
        autoUpdate = !autoUpdate;
        if (autoUpdate) {
            $("#bt-update").addClass("closed");
            $("#bt-auto-update-slider").addClass("activated");
            updateInterval = setInterval(function () {
                sendUpdate();
            }, 1000);
        } else {
            $("#bt-update").removeClass("closed");
            $("#bt-auto-update-slider").removeClass("activated");
            clearInterval(updateInterval);

        }
    });

    function sendMessage(msg, name) {
        msg = msg.trim();
        if (msg !== "") {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    sendUpdate();
                }
            };
            xhttp.open("POST", "post_message", true);
            xhttp.setRequestHeader("Content-type", "application/json");

            var data = {};
            data.name = name.trim() !== "" ? name.trim().substr(0, 20) : "unknown user";
            data.time = new Date();
            data.message = msg.substr(0, 200);
            data.start = lastMessageTimestamp;
            data.lastSync = lastFullSync;
            xhttp.send(JSON.stringify(data));
            console.log("Post message");
            $("#input-field").val("");
        }
    }

    function sendUpdate() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                handleResponse(xhttp.response);
            }
        };
        xhttp.open("POST", "post_update", true);
        xhttp.setRequestHeader("Content-type", "application/json");

        var data = {};
        data.start = lastMessageTimestamp;
        data.lastSync = lastFullSync;
        xhttp.send(JSON.stringify(data));
        console.log("Update messages");
    }

    function handleResponse(jsonData) {
        var data = JSON.parse(jsonData);

        var msgs = data.msgs;

        if (msgs === null) {
            return;
        }

        if (lastFullSync != data.lastSync) {
            $("#message-list").empty();
            lastFullSync = data.lastSync;
        }

        var divObj;
        console.log(data);
        for (var i = 0; i < msgs.length; i++) {
            divObj = $('<div class="message-box"> <div class="message-box-metadata">' + removeHtmlEntities(msgs[i].time) + ' - ' + removeHtmlEntities(msgs[i].name) +
                '</div> <div class="message-box-text">' + removeHtmlEntities(msgs[i].message) + '</div></div>');
            $("#message-list").prepend(divObj);
            if (msgs.length <= 3) {
                divObj.slideDown();
            } else {
                divObj.show();
            }
        }

        if (msgs !== null) {
            if (msgs.length > 0) {
                lastMessageTimestamp = msgs[msgs.length - 1].timestamp;
            }
        }
    }

    function removeHtmlEntities(input) {
        return $('<span/>').text(input).html();
        //return input;
    }
});
