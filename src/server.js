import express from "express";
import http, { Server } from "http";
import { off } from "process";
import socketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

io.on("connection", (socket) => {
    socket.nickname = 'Anonymous';

    socket.on("join_room", (data) => {
        socket.join(data.room);
        socket.nickname = data.nickName;
    });
    
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});

httpServer.listen(3000, () => console.log(`Listening on http://localhost:3000`));