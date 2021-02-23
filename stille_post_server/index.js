var express = require("express");
var fs = require("fs");
//    https =      require('https'),
var http = require("http");
var app = express();
var server = http.createServer(app);
var crypto = require("crypto");
var clients = [];

//
var lobbies = {};
// XXX(id): {players: [name1, name2...], sockets: {name1: socket, name2: socket}}

/* Besseres logging */
var log = function () {
    return console.log.apply(
        console,
        ["[" + new Date().toISOString().slice(11, -5) + "]"].concat(
            Array.prototype.slice.call(arguments)
        )
    );
};

/* redis + socket.io */
const io = require("socket.io")(server);
server.listen(8040);
log("Starte Websocket Server");

io.on("connection", function (socket) {
    // var hostname = socket.handshake.headers.host.toLowerCase();

    socket.on("disconnect", function (data) {});

    socket.on("createLobby", function (data) {
        let lobbyId = Math.floor(Math.random() * 1000000000).toString(16);

        lobbies[lobbyId] = { players: [data.name] };
        lobbies[lobbyId].sockets = {};
        lobbies[lobbyId].sockets[data.name] = socket;

        socket.emit("joinLobby", { lobbyId: lobbyId, players: [data.name] });
    });

    socket.on("joinLobby", function (data) {
        for (var key in lobbies[data.lobbyId].sockets) {
            lobbies[data.lobbyId].sockets[key].emit("playerJoinsLobby", {
                name: data.name,
            });
        }

        lobbies[data.lobbyId].players.push(data.name);
        lobbies[data.lobbyId].sockets[data.name] = socket;
        socket.emit("joinLobby", {
            lobbyId: data.lobbyId,
            players: lobbies[data.lobbyId].players,
        });
    });

    socket.on("startGame", function (data) {
        console.log(lobbies[data.lobbyId].sockets);
        // randomize player order
        shuffle(lobbies[data.lobbyId].players);
        lobbies[data.lobbyId].submitted = 0;

        lobbies[data.lobbyId].playerContent = {};

        // calculate which player sends to which other player
        lobbies[data.lobbyId].sendToPlayer = {};
        for (var i = 0; i < lobbies[data.lobbyId].players.length; i++) {
            let curPlayer = lobbies[data.lobbyId].players[i];
            let nextPlayer =
                lobbies[data.lobbyId].players[
                    (i + 1) % lobbies[data.lobbyId].players.length
                ];
            lobbies[data.lobbyId].sendToPlayer[curPlayer] = nextPlayer;
            console.log(curPlayer, nextPlayer);
        }

        for (var key in lobbies[data.lobbyId].sockets) {
            lobbies[data.lobbyId].sockets[key].emit("startGame", {
                players: lobbies[data.lobbyId].players,
                sendToPlayer: lobbies[data.lobbyId].sendToPlayer,
            });
        }
    });

    socket.on("submitWord", function (data) {
        lobbies[data.lobbyId].playerContent[data.player] = [data.word];

        lobbies[data.lobbyId].submitted += 1;
        playerSubmittedAnswer(data);

        if (
            lobbies[data.lobbyId].submitted >=
            lobbies[data.lobbyId].players.length
        ) {
            for (var key in lobbies[data.lobbyId].sockets) {
                let receiverName = lobbies[data.lobbyId].sendToPlayer[key];
                lobbies[data.lobbyId].sockets[receiverName].emit(
                    "startDrawRound",
                    {
                        word: lobbies[data.lobbyId].playerContent[key][0],
                    }
                );
            }
            lobbies[data.lobbyId].submitted = 0;
            lobbies[data.lobbyId].round = 1;
        }
    });

    socket.on("submitDrawing", function (data) {
        // add drawing
        lobbies[data.lobbyId].playerContent[data.player].push(data.image);

        lobbies[data.lobbyId].submitted += 1;
        playerSubmittedAnswer(data);

        if (
            lobbies[data.lobbyId].submitted >=
            lobbies[data.lobbyId].players.length
        ) {
            for (var key in lobbies[data.lobbyId].sockets) {
                let receiverName = lobbies[data.lobbyId].sendToPlayer[key];
                lobbies[data.lobbyId].sockets[receiverName].emit(
                    "startGuessRound",
                    {
                        image:
                            lobbies[data.lobbyId].playerContent[key][
                                lobbies[data.lobbyId].playerContent[key]
                                    .length - 1
                            ],
                    }
                );
            }
            lobbies[data.lobbyId].submitted = 0;
            lobbies[data.lobbyId].round = 1;
        }
    });

    socket.on("submitGuess", function (data) {
        // add guess
        lobbies[data.lobbyId].playerContent[data.player].push(data.word);

        lobbies[data.lobbyId].submitted += 1;
        playerSubmittedAnswer(data);

        if (
            lobbies[data.lobbyId].submitted >=
            lobbies[data.lobbyId].players.length
        ) {
            for (var key in lobbies[data.lobbyId].sockets) {
                let receiverName = lobbies[data.lobbyId].sendToPlayer[key];
                lobbies[data.lobbyId].sockets[receiverName].emit(
                    "startDrawRound",
                    {
                        word:
                            lobbies[data.lobbyId].playerContent[key][
                                lobbies[data.lobbyId].playerContent[key]
                                    .length - 1
                            ],
                    }
                );
            }
            lobbies[data.lobbyId].submitted = 0;
            lobbies[data.lobbyId].round = 1;
        }
    });
});

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function playerSubmittedAnswer(data) {
    for (var key in lobbies[data.lobbyId].sockets) {
        lobbies[data.lobbyId].sockets[key].emit("playerSubmitted", {
            name: data.player,
        });
    }
}
