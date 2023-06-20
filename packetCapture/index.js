const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

wss.on('connection', (ws) => {
  tcpdump.stdout.on('data', (data) => {
    const packet = data.toString();
    ws.send(packet);
  });
});

const tcpdump = spawn('tcpdump', ['-i', 'br_dev', '-l', '-vv']);

tcpdump.stdout.on('data', (data) => {
  const packet = data.toString();
  wss.clients.forEach((client) => {
    client.send(packet);
  });
});

tcpdump.stderr.on('data', (data) => {
  console.error(`tcpdump error: ${data}`);
});

tcpdump.on('close', (code) => {
  console.log(`tcpdump process exited with code ${code}`);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
