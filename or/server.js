const express = require('express');
const helmet = require('helmet');
const app = express();
const http = require('http').createServer(app);
const socketIO = require('socket.io');
const io = socketIO(http);

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log(`নতুন ক্লায়েন্ট যুক্ত হয়েছে: ${socket.id}`);

  socket.on('audio-chunk', (data) => {
    socket.broadcast.emit('audio-chunk', data);
  });

  socket.on('program-info', (info) => {
    io.emit('program-info', info);
  });

  socket.on('disconnect', () => {
    console.log(`ক্লায়েন্ট ডিসকানেক্ট হয়েছে: ${socket.id}`);
  });
});

http.listen(PORT, () => {
  console.log(`সার্ভার চালু হয়েছে পোর্ট ${PORT} তে`);
});
