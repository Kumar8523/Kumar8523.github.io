const connectBtn = document.getElementById('connectBtn');
const audioPlayer = document.getElementById('audioPlayer');

let peerConnection;
let mediaStream;

const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// ✅ মাইক্রোফোন পারমিশন ও ডিভাইস চেক করা
async function checkMicrophone() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        if (audioDevices.length === 0) {
            alert("⚠️ No microphone found! Please connect a microphone.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error checking devices:", error);
        return false;
    }
}

// ✅ সিগন্যাল অফার নেওয়া ও অডিও স্ট্রিম শুরু করা
async function startReceiving() {
    try {
        const micAvailable = await checkMicrophone();
        if (!micAvailable) return;

        const offer = await fetchSignalOffer();
        if (!offer) return alert("No signal offer received!");

        peerConnection = new RTCPeerConnection(servers);

        peerConnection.ontrack = event => {
            const [stream] = event.streams;
            audioPlayer.srcObject = stream;
        };

        const desc = new RTCSessionDescription(offer);
        await peerConnection.setRemoteDescription(desc);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        sendSignalAnswer(answer);
    } catch (error) {
        console.error("Error in receiving signal: ", error);
    }
}

connectBtn.addEventListener('click', startReceiving);
