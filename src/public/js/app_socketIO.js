const socket = io();

socket.on("connect", (socket) => {
    console.log(socket);
});

socket.on("disconnect", (socket) => {
    console.log(socket);
});

const welcome = document.querySelector("#welcome");
const enterRoomForm = welcome.querySelector("#enter_room");

const room = document.querySelector("#room");
const chatForm = room.querySelector("#message");

let roomName;

function addMsg (msg) {
    const ul = room.querySelector("#chatList");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

function refreshTitle(roomName, userCount) {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room : ${roomName} (${userCount})`;
}

room.hidden = true;

enterRoomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input_roomName = enterRoomForm.querySelector("#inp_roomName");
    const input_nickName = enterRoomForm.querySelector("#inp_nickName");

    socket.emit(
        "enter_room", 
        { 
            room : input_roomName.value,
            nickname : input_nickName.value
        },
        () => {
            welcome.hidden = true;
            room.hidden = false;

            const h3 = room.querySelector('h3');
            h3.innerText = `Room : ${roomName}`;
        }
    );
    roomName = input_roomName.value;
    input_roomName.value = "";
    input_nickName.value = "";
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = room.querySelector("#message input");
    let chatMsg;

    socket.emit("chat_everyone", { roomName: roomName, payload: input.value}, () => {
        addMsg(`You : ${chatMsg}`);
    })

    chatMsg = input.value;
    input.value = "";
});

socket.on("welcome", (user, userCount) => {
    addMsg(`${user} joined`);

    const h3 = room.querySelector('h3');
    h3.innerText = `Room : ${roomName} (${userCount})`;

    // refreshTitle(userCount);
});

socket.on("bye", (user, userCount) => {
    addMsg(`${user} left`);
    // refreshTitle(userCount);

    const h3 = room.querySelector('h3');
    h3.innerText = `Room : ${roomName} (${userCount})`;

});

socket.on("sendMsg", (msg) => {
    addMsg(msg);
})

// socket.on("room_change", (msg) => {console.log(msg)}); 
socket.on("room_change", (rooms) => {
    const roomListBox = document.querySelector("#roomList ul");
    roomListBox.innerHTML = '';

    rooms.forEach(room => {        
        const li = document.createElement('li');
        li.innerText = room;

        roomListBox.append(li);
    });
}); 