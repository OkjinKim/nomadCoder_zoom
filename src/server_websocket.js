import express from "express";
import http, { Server } from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket.nickname = "Anonymous"
    console.log("Connected to the Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (message) => { 
        // console.log(JSON.parse(message));

        const msgJson = JSON.parse(message);

        switch(msgJson.type){
            case "new_message" :
                sockets.forEach(
                    (aSocket) => aSocket.send( `${socket.nickname} : ${msgJson.payload}` )
                );
                break;

            case "nickname" : 
            socket.nickname = msgJson.payload;
            console.log(sockets);
                break;

        }        
    });
    // socket.send("hello");
});

server.listen(3000, handleListen);


