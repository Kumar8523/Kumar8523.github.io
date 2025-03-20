let bluetoothDevice;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let mediaRecorder;
let audioChunks = [];

// 🔵 Bluetooth Connect
async function connectBluetooth() {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });
        console.log("✅ Connected to:", bluetoothDevice.name);
    } catch (error) {
        console.error("❌ Connection Failed:", error);
    }
}

// 🎤 Start Recording Voice
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.start();
            console.log("🎤 Recording Started...");
        })
        .catch(error => console.error("❌ Microphone Access Denied:", error));
}

// ⏹️ Stop Recording & Play Voice
function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        let audioURL = URL.createObjectURL(audioBlob);
        let audio = new Audio(audioURL);
        audio.play();
        console.log("🔊 Playing Recorded Audio...");
    };
}

document.getElementById("connectBtn").addEventListener("click", connectBluetooth);
document.getElementById("startRecording").addEventListener("click", startRecording);
document.getElementById("stopRecording").addEventListener("click", stopRecording);
