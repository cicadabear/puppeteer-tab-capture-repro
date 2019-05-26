chrome.runtime.onMessage.addListener(request => {
    console.log(request);
    switch (request) {
        case 'START_RECORDING':
            console.log('START_RECORDING');
            startRecording();
            break;
        case 'STOP_RECORDING':
            console.log('STOP_RECORDING');
            stopRecording();
            break;
        case 'downloadComplete':
            console.log('downloadComplete---' + document.documentElement.innerHTML);
            document.querySelector('html').classList.add('downloadComplete');
            break;
        default:
            console.log('UNKNOWN_REQUEST');
    }
});
chrome.downloads.onChanged.addListener(function (delta) {
    console.log('downloads.onChanged' + JSON.stringify(delta));
    if (!delta.state || (delta.state.current != 'complete')) {
        return;
    }
    try {
        port.postMessage('downloadComplete');
        document.querySelector('html').classList.add('downloadComplete');
        console.log(downloads.onChanged + document.documentElement.innerHTML);
    } catch (e) {
    }
});
var chunks = [];
var recorder;

function startRecording() {
    console.log('Starting to record.');
    var reader = new FileReader();
    reader.onloadend = function() {
        base64data = reader.result;
        // console.log(base64data);
        sendNativeMessage(base64data);
    };
    connect();
    const options = {audio: true, video: true};
    chrome.tabCapture.capture(options, (stream) => {
        console.log('capture');
        if (stream === null) {
            console.log(`Last Error: ${chrome.runtime.lastError.message}`);
            return;
        }

        try {
            recorder = new MediaRecorder(stream);
        } catch (err) {
            console.log(err.message);
            return;
        }

        console.log('Recroder is in place.');
        recorder.addEventListener('dataavailable', event => {
            const {data: blob, timecode} = event;
            if (event.data.size > 0) {
                // chunks.push(event.data);
                console.log('---event.data---'+event.data);
                reader.readAsDataURL(event.data);
                // stopRecording();
            }
            console.log(`${new Date().toLocaleTimeString()} Got another blob: ${timecode}: ${blob}`);
        });
        const timeslice = 1 * 1000;
        recorder.start(timeslice);
    });
}

function stopRecording() {
    port.disconnect();//
    recorder.stop();
    console.log('Stopping to record.');
    downloadVideo(chunks)
}
function downloadVideo(data) {
    var superBuffer = new Blob(data, {
        type: 'video/webm'
    });

    var url = URL.createObjectURL(superBuffer);
    // var a = document.createElement('a');
    // document.body.appendChild(a);
    // a.style = 'display: none';
    // a.href = url;
    // a.download = 'test.webm';
    // a.click();
    var filename = 'test.webm';
    // chrome.downloads.download({
    //     url: url,
    //     filename: filename
    // }, () => {
    // });
}
function sendNativeMessage(text) {
    message = {"text": text};
    port.postMessage(message);
}

function onNativeMessage(message) {
    // appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
    console.log(message);
}

function onDisconnected() {
    // appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
    console.log("Failed to connect: " + chrome.runtime.lastError.message);
    port = null;
    // updateUiState();
}

let port;

function connect() {
    var hostName = "com.google.chrome.example.echo";
    // appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
    // updateUiState();
}

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}