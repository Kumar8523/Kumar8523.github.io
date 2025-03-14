// পাসওয়ার্ড চেক
const password = prompt('অ্যাডমিন পাসওয়ার্ড দিন:');
if (password !== 'secret123') {
  window.location.href = '/';
}

document.getElementById('audioForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('audioFile');
  const urlInput = document.getElementById('audioUrl').value;

  if (fileInput.files[0]) {
    const formData = new FormData();
    formData.append('audio', fileInput.files[0]);
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      const ws = new WebSocket('ws://localhost:3000');
      ws.onopen = () => {
        ws.send(JSON.stringify({ 
          type: 'audioUpdate', 
          url: `/uploads/${data.filename}`
        }));
        ws.close();
      };
    } catch (error) {
      console.error('আপলোড ব্যর্থ:', error);
    }
  } else if (urlInput) {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: 'audioUpdate', 
        url: urlInput 
      }));
      ws.close();
    };
  }
});

// লাইভ ভয়েস রেকর্ডিং
let mediaRecorder;
document.getElementById('startLive').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start(1000);

    mediaRecorder.ondataavailable = async (e) => {
      const ws = new WebSocket('ws://localhost:3000');
      const audioBlob = new Blob([e.data], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'audioUpdate',
          url: audioUrl
        }));
        ws.close();
      };
    };
  } catch (error) {
    alert('মাইক্রোফোন এক্সেস ব্যর্থ!');
  }
});
