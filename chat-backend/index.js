const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const socketio = require('socket.io');

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log(`connection is at ${socket.id}`);

  socket.on('send', (data) => {
    io.emit('receive', {
      msg: data.msg,
      id: socket.id,
      username: users[socket.id],
      time: data.time
    });
  });

  socket.on('login', (data) => {
    users[socket.id] = data.username;
  });

  socket.on('typing', () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit('user-typing', username);
    }
  });
});

app.use('/', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`server connected at ${port}`);
});
