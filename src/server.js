import express from "express";
import http, { Server } from "http";
import socketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

httpServer.listen(3000, () => console.log(`Listening on http://localhost:3000`));