document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    startButton.onclick = () => { chrome.runtime.sendMessage('START_RECORDING') };
    stopButton.onclick = () => { chrome.runtime.sendMessage('STOP_RECORDING') };
});