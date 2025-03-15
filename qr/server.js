const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fileType = require('file-type');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket connection
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast message to all clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

// API endpoint for file type detection
app.post('/detect-file-type', express.json(), (req, res) => {
    const buffer = Buffer.from(req.body.data, 'base64');
    const type = fileType.fromBuffer(buffer);
    
    if (type) {
        res.json({
            ext: type.ext,
            mime: type.mime
        });
    } else {
        res.status(400).json({ error: 'Unknown file type' });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
