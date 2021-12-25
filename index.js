const { env } = require("process");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

gameChars = [];

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

io.on('connection', (socket) => {
  socket.on('renderPlayer', (player) => {
      socket.broadcast.emit("renderPlayers",player);
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit("clearAllPlayers",{});
  });
});

server.listen(process.env.PORT||8000, () => {
  console.log('listening on *:3000');
});