console.log('This is main.js');

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

window.process = { browser: true, env: { ENVIRONMENT: 'BROWSER' } };

 

const key = "CryptoJS.enc.Hex.parse(CryptoJS.lib.WordArray.random(16).toString())"
console.log(key);

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


console.log("User "+ username+ " Room name "+room);

const socket = io();

// Join chatroom
socket.emit('joinRoom', {username,room});

// Get room and users
socket.on('roomUsers', ({ room, users}) =>{
    outputRoomName(room);
    // console.log("users 1 are" + users);
    outputUsers(users);
})


// Message from server
socket.on('message', message =>{
    // console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message submit
chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    const msg = document.getElementById('msg').value;
    // console.log(msg);

    // Emit message to server
    const encryptedMessage = CryptoJS.AES.encrypt(msg, key).toString();
    // console.log("encrypted " +encryptedMessage);
    socket.emit('chatMessage', encryptedMessage);

    document.getElementById('msg').value = '';
    document.getElementById('msg').focus();
})


// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
                ${message.text}
            </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    // console.log("this is output users");
    userList.innerHTML = '';
    console.log("Usres are"+ users);
  users.forEach((user) => {
    console.log("this is for each");
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    } else {
    }
});