const audio = document.getElementById('audioPlayer');
const volumeControl = document.getElementById('volumeControl');

// ভলিউম কন্ট্রোল
volumeControl.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// পজ বাটন ডিজেবল
audio.addEventListener('pause', () => {
  audio.play();
});

// ওয়েবসকেট কানেকশন
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'audioUpdate') {
    audio.src = data.url;
    audio.play();
  }
};
