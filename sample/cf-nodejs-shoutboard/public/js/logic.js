document.addEventListener('DOMContentLoaded', () => {
    var lastMessageTimestamp = 0;
    var lastFullSync = 0;
    var autoUpdate = false;
    var updateInterval;

    const fieldInput = document.getElementById("input-field");
    const fieldName = document.getElementById("name-field");
    const btSend = document.getElementById("bt-send");
    const btUpdate = document.getElementById("bt-update");
    const btAutoUpdate = document.getElementById("bt-auto-update");
    const btAutoUpdateSlider = document.getElementById("bt-auto-update-slider");
    const messageList = document.getElementById("message-list");

    fieldInput.addEventListener("keypress", event => {
        if (event.which == 13) {
            sendMessage(fieldInput.value, fieldName.value);
        }
    });

    btSend.addEventListener("click", () => {
        sendMessage(fieldInput.value, fieldName.value);
    });

    btUpdate.addEventListener("click", () => {
        requestUpdate();
    });

    btAutoUpdate.addEventListener("click", () => {
        autoUpdate = !autoUpdate;
        if (autoUpdate) {
            btAutoUpdateSlider.classList.add("activated");
            updateInterval = setInterval(() => {
                requestUpdate();
            }, 1000);
        } else {
            btAutoUpdateSlider.classList.remove("activated");
            clearInterval(updateInterval);
        }
    });

    function sendMessage(msg, name) {
        msg = msg.trim();
        if (msg !== "") {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    requestUpdate();
                }
            };
            xhttp.open("POST", "post_message", true);
            if(name) {
                xhttp.setRequestHeader("remote-user",name);
            }
            xhttp.setRequestHeader("Content-type", "application/json");

            var data = {};
            data.name = name.trim() !== "" ? name.trim().substr(0, 20) : "unknown user";
            data.time = new Date();
            data.message = msg.substr(0, 200);
            data.start = lastMessageTimestamp;
            data.lastSync = lastFullSync;
            xhttp.send(JSON.stringify(data));
            fieldInput.value = "";
            console.log("Post message");
        }
    }

    function requestUpdate() {
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
            messageList.innerHTML = "";
            lastFullSync = data.lastSync;
        }

        for (var i = 0; i < msgs.length; i++) {

            var divBox = document.createElement('div');
            divBox.className = 'message-box';

            var divMetadata = document.createElement('div');
            divMetadata.className = 'message-box-metadata';
            divMetadata.innerText = msgs[i].time + ' - ' + msgs[i].name;

            var divText = document.createElement('div');
            divText.className = 'message-box-text';
            divText.innerHTML = msgs[i].message;

            messageList.prepend(divBox);
            divBox.append(divMetadata);
            divBox.append(divText);

           /* if (msgs.length <= 3) {
                divObj.slideDown();
            } else {
                divObj.show();
            }*/
        }

        if (msgs !== null) {
            if (msgs.length > 0) {
                lastMessageTimestamp = msgs[msgs.length - 1].timestamp;
            }
        }
    }

    requestUpdate();
});