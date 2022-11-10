import express from "express";
import http, { Server } from "http";
import WebSocket from "ws";
import socketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

function publicRooms() {
    // const { 
    //     sockets: {
    //         adapter: { sids, rooms },
    //         }, 
    //     } = io;

    // console.log(io.sockets.adapter);
    const sids = io.sockets.adapter.sids;
    const rooms = io.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((val, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });

    return publicRooms;
}

function countRoom (roomName) {
   return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => { 
    // socket.emit("hello", "world");

    // console.log(socket.rooms);
    socket.nickname = 'Anonymous';

    socket.on("enter_room", (data, cbFn)=> {
        // console.log(roomName);
        socket.join(data.room);
        // console.log(socket.rooms);
        socket.nickname = data.nickname;

        io.sockets.emit("room_change", publicRooms());
        
        cbFn();
        
        socket.to(data.room).emit("welcome", socket.nickname, countRoom(data.room)); 
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach( room => { socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)});
    });

    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
    });

    socket.on("chat_everyone", (data, cbFn) => {
        socket.to(data.roomName).emit("sendMsg", `${socket.nickname} : ${data.payload}`);
        cbFn()
    });

});

httpServer.listen(3000, () => console.log(`Listening on http://localhost:3000`));


// const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket.nickname = "Anonymous"
//     console.log("Connected to the Browser ✅");
//     socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//     socket.on("message", (message) => { 
//         // console.log(JSON.parse(message));

//         const msgJson = JSON.parse(message);

//         switch(msgJson.type){
//             case "new_message" :
//                 sockets.forEach(
//                     (aSocket) => aSocket.send( `${socket.nickname} : ${msgJson.payload}` )
//                 );
//                 break;

//             case "nickname" : 
//             socket.nickname = msgJson.payload;
//             console.log(sockets);
//                 break;

//         }        
//     });
//     // socket.send("hello");
// });

// server.listen(3000, handleListen);


