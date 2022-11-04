const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector('ul');
const nicknameform = document.querySelector('#nicknameForm');
const messageform = document.querySelector('#msgForm');

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

socket.addEventListener("close", () => {
    console.log("disconnected from Server ❌");
});

socket.addEventListener("message", (message) => {
    // console.log("New message: ", message.data);
    
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

nicknameform.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = nicknameform.querySelector("input");
    socket.send(JSON.stringify({
        type: "nickname",
        payload: input.value
    }));
    input.value ="";
});

messageform.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageform.querySelector("input");
    socket.send(JSON.stringify({
        type: "new_message",
        payload: input.value
    }));
    input.value ="";
});