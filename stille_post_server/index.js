const WebSocket = require("ws");

var express = require("express");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var MemoryStore = require("memorystore")(session);

var app = express();
app.use(cookieParser());
app.use(
    session({
        cookie: { maxAge: 86400000 },
        store: new MemoryStore({
            checkPeriod: 86400000, // prune expired entries every 24h
        }),
        resave: false,
        secret: "keyboard cat",
        saveUninitialized: true,
    })
);

const wss = new WebSocket.Server({ port: 8082 });

var id = 0;
var clients = {};

wss.on("connection", (ws) => {
    console.log("New client connected!");
    console.log(id % 2);
    ws.id = id % 2;
    clients[ws.id] = ws;
    id++;

    ws.on("message", (data) => {
        //console.log(`Client has send us: ${data}`);
        var jsonData = JSON.parse(data);
        if (jsonData.type === "image") {
            if (ws.id == 0) {
                clients[1].send(data);
            } else if (ws.id == 1) {
                clients[0].send(data);
            }
        } else if (jsonData.type === "circle") {
            if (ws.id == 0) {
                clients[1].send(data);
            } else if (ws.id == 1) {
                clients[0].send(data);
        }
    });

    ws.on("close", () => {
        console.log("Client has disconnected!");
    });
});
