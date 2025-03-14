const express = require('express');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// স্ট্যাটিক ফাইল সার্ভ করুন
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ওয়েবসকেট সার্ভার সেটআপ
const server = app.listen(3000, () => {
  console.log('সার্ভার চলছে http://localhost:3000 এ');
  if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // সকল ক্লায়েন্টকে অডিও আপডেট পাঠান
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// অডিও আপলোড হ্যান্ডলার
app.post('/upload', upload.single('audio'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).send('কোনো ফাইল আপলোড হয়নি');
  }
});
