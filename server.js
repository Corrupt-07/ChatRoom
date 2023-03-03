const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const CryptoJS = require("crypto-js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


const botname = 'ChatRoom Bot';
const key = "CryptoJS.enc.Hex.parse(CryptoJS.lib.WordArray.random(16).toString())";

// Run when client connects
io.on('connection', socket => {
    // console.log('New WS connection...');

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room)
        // Welcome current user
        socket.emit('message', formatMessage(botname, 'Welcome to Chat Room'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(username, `${user.username} has joined the chat`));

        // Send users and room info

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    // Listen for chatMessage
    socket.on('chatMessage', (encryptedMessage) => {
        const decryptedMessage = CryptoJS.AES.decrypt(encryptedMessage, key).toString(CryptoJS.enc.Utf8);
        // console.log("decrypted "+decryptedMessage);
        // console.log(msg);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, decryptedMessage))
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botname, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});





const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});