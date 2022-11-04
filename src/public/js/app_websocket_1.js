const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector('ul');
const messageform = document.querySelector('form');

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
    // console.log("New message: ", message.data);
    
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("disconnected from Server ❌");
});

messageform.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = messageform.querySelector("input");
    socket.send(input.value)
    input.value ="";
});