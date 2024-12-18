var canvas;
var boundings;
var context;
var guessContext;

var socket;
var query;

var lobbyName;
var playerName;

var lobbyPlayers;

var initialBrushWidth = 5;

window.onload = function () {
    $("#howToPlayButton").on("click", function () {
        $("#how-to-play").removeClass("d-none");
        $("#howToPlayButton").addClass("d-none");
    });

    socket = io.connect(
        "127.0.0.1:7040", // WS-IP
        {
            reconnect: true,
            transports: ["websocket"],
            forceNew: true,
        }
    );

    $("#addButton").click(function () {
        $("#testDiv").addClass("d-none");
    });

    $("#removeButton").click(function () {
        $("#testDiv").removeClass("d-none");
    });

    // Definitions
    canvas = new fabric.Canvas("paint-canvas");
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = initialBrushWidth;
    canvas.freeDrawingBrush.color = "#000000";
    canvas.add(
        new fabric.Rect({
            left: 0,
            top: 0,
            fill: "white",
            width: canvas.width,
            height: canvas.height,
        })
    );
    initFillBucket();

    $("#brushRange").val(initialBrushWidth);
    $("#colorPicker").on("input", function () {
        canvas.freeDrawingBrush.color = $("#colorPicker").val();
    });

    // Create color buttons
    setUpColors();

    guessCanvas = document.getElementById("guess-canvas");
    guessContext = guessCanvas.getContext("2d");

    document
        .getElementById("brushRange")
        .addEventListener("change", function () {
            canvas.freeDrawingBrush.width = $("#brushRange").val();
        });

    // Handle Clear Button
    var clearButton = document.getElementById("clear");

    clearButton.addEventListener("click", function () {
        canvas.clear();
        canvas.add(
            new fabric.Rect({
                left: 0,
                top: 0,
                fill: "white",
                width: canvas.width,
                height: canvas.height,
            })
        );
        enableDrawing();
    });

    // eraser
    document.getElementById("eraser").addEventListener("click", function () {
        canvas.freeDrawingBrush.color = "#FFFFFF";
        enableDrawing();
    });

    // fill tool
    document
        .getElementById("fillButton")
        .addEventListener("click", function () {
            enableFillBucket();
        });

    // update join / create lobby button
    query = window.location.href.split("?")[1];
    let lobbyButton = document.getElementById("joinButton");
    if (query != undefined) {
        lobbyButton.innerHTML = "Join Lobby";
        lobbyButton.onclick = joinLobby;
    } else {
        lobbyButton.innerHTML = "Create Lobby";
        lobbyButton.onclick = createLobby;
    }

    $("#nameForm").on("submit", function (e) {
        e.preventDefault();
    });

    $("#submitWordForm").on("submit", function (e) {
        e.preventDefault();
    });

    $("#undoButton").on("click", function (e) {
        if (canvas.historyUndo.length > 1) {
            canvas.undo();
        }
    });
    $("#redoButton").on("click", function (e) {
        canvas.redo();
    });

    $("#copyLobbyId").click(function () {
        var copyText = document.getElementById("lobbyIdInput");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        let sel = document.getSelection();
        sel.removeAllRanges();
    });

    $("#startButton").click(startGame);

    $("#submitWordButton").click(submitWord);

    $("#submitDraw").click(submitDraw);
    $("#submitGuess").click(submitGuess);

    // socket stuff

    socket.on("connect", function (data) {});

    socket.on("joinLobby", function (data) {
        lobbyName = data.lobbyId;
        lobbyPlayers = data.players;
        data.players.forEach((player) => {
            $("#players").append("<div class='whiteFont'>" + player + "</div>");
        });
        if (window.location.href.includes("?")) {
            $("#lobbyIdInput").val(window.location.href);
        } else {
            $("#lobbyIdInput").val(
                stripTrailingSlash(window.location.href) + "/?" + data.lobbyId
            );
        }

        $("#lobbyCreator").addClass("d-none");
        $("#lobby").removeClass("d-none");
        console.log("Lobby joined", data);
    });

    socket.on("playerJoinsLobby", function (data) {
        lobbyPlayers.push(data.name);
        let playerDiv = document.createElement("div");
        playerDiv.id = data.name + "LobbyName";
        playerDiv.classList.add("whiteFont");
        $("#players").append(
            "<div id='" +
                data.name +
                "LobbyName' class='whiteFont'>" +
                data.name +
                "</div>"
        );
    });

    socket.on("startGame", function (data) {
        console.log(data);
        let players = data.players;
        let row = document.createElement("div");
        row.classList.add("row");
        for (var i = 0; i < players.length; i++) {
            let readyDiv = document.createElement("div");
            readyDiv.id = players[i] + "SubmittedCircle";
            readyDiv.classList.add("dot-grey");
            readyDiv.classList.add("m-1");
            row.appendChild(readyDiv);

            let nameDiv = document.createElement("div");
            nameDiv.id = players[i] + "Div";
            nameDiv.innerHTML = players[i];
            //nameDiv.style.width = "150px";
            nameDiv.classList.add("m-1");
            nameDiv.classList.add("whiteFont");
            row.appendChild(nameDiv);

            if (i < players.length - 1) {
                let arrowDiv = document.createElement("img");
                arrowDiv.src = "/images/arrow.svg";
                arrowDiv.width = "30";
                arrowDiv.height = "30";
                arrowDiv.classList.add("right");
                row.appendChild(arrowDiv);
            }
        }
        $("#playerOrder").append(row);
        $("#lobby").addClass("d-none");
        $("#playerOrder").removeClass("d-none");
        $("#playerOrder").addClass("d-flex");
        $("#playerOrder").addClass("justify-content-center");
        $("#submitWord").removeClass("d-none");
        $("#submitWord").addClass("d-flex");
        $("#submitWord").addClass("justify-content-center");
    });

    socket.on("playerSubmitted", function (data) {
        document.getElementById(
            data.name + "SubmittedCircle"
        ).style.backgroundColor = "#32a852";
    });

    socket.on("startDrawRound", function (data) {
        $("#guessWord").html(data.word);
        console.log("Start Draw Round", data);
        resetSubmitCircles();
        showDrawing();
        canvas.calcOffset();
        canvas.clear();
        canvas.add(
            new fabric.Rect({
                left: 0,
                top: 0,
                fill: "white",
                width: canvas.width,
                height: canvas.height,
            })
        );
    });

    socket.on("startGuessRound", function (data) {
        let image = new Image();
        image.onload = function () {
            guessContext.drawImage(image, 0, 0);
        };
        image.src = data.image;
        resetSubmitCircles();
        showGuessing();
    });

    socket.on("endGame", function (data) {
        displayResults(data);
        $("#resultDiv").removeClass("d-none");
    });

    socket.on("error", function (data) {
        showAlertMessage(data.message);
    });

    socket.on("playerDisconnected", function (data) {
        console.log("player disconnected");
        document.getElementById(data.name + "LobbyName").remove();
        showAlertMessage("<strong>" + data.name + "</strong> disconnected.");

        // if game has not started remove player from lobby
    });

    // Fill Bucket
    canvas.on("mouse:down", function (options) {
        if (fillBucket) {
            let tmpColorLayerData = document
                .getElementById("paint-canvas")
                .getContext("2d")
                .getImageData(0, 0, canvasWidth, canvasHeight);

            fillCollorAtCoords(
                options.e.offsetX,
                options.e.offsetY,
                tmpColorLayerData,
                canvas.width,
                canvas.height,
                canvas.data
            );
        }
    });
};

function createLobby() {
    if ($("#nameInput").val() != "") {
        playerName = $("#nameInput").val();
        $("#startButton").removeClass("d-none");
        socket.emit("createLobby", { name: playerName });
    } else {
        console.log("enter name");
    }
}

function joinLobby() {
    if ($("#nameInput").val() != "") {
        playerName = $("#nameInput").val();
        socket.emit("joinLobby", {
            name: playerName,
            lobbyId: query,
        });
    } else {
        console.log("enter name");
    }
}

function startGame() {
    socket.emit("startGame", { lobbyId: lobbyName });
}

function showDrawing() {
    $("#drawCanvasDiv").removeClass("d-none");
    notWaitingForPlayers();
}

function showGuessing() {
    $("#guessCanvasDiv").removeClass("d-none");
    notWaitingForPlayers();
}

function waitingForPlayers() {
    $("#drawCanvasDiv").addClass("d-none");
    $("#guessCanvasDiv").addClass("d-none");
    $("#submitWord").addClass("d-none");

    $("#waiting").removeClass("d-none");
}

function notWaitingForPlayers() {
    $("#waiting").addClass("d-none");
}

function submitWord() {
    let word = $("#submitWordInput").val();
    socket.emit("submitWord", {
        player: playerName,
        lobbyId: lobbyName,
        word: word,
    });
    $("#submitWord").removeClass("d-flex");
    $("#submitWord").removeClass("justify-content-center");
    waitingForPlayers();
}

function submitDraw() {
    socket.emit("submitDrawing", {
        player: playerName,
        lobbyId: lobbyName,
        image: canvas.toDataURL(),
    });
    waitingForPlayers();
}

function submitGuess() {
    // TODO clear input field
    socket.emit("submitGuess", {
        player: playerName,
        lobbyId: lobbyName,
        word: $("#guessInput").val(),
    });

    $("#guessInput").val("");
    waitingForPlayers();
}

function resetSubmitCircles() {
    lobbyPlayers.forEach((player) => {
        document.getElementById(
            player + "SubmittedCircle"
        ).style.backgroundColor = "#8a8a8a";
    });
}

function setUpColors() {
    let colors = [
        "#000000",
        "#4d4d4d",
        "#999999",
        "#cccccc",
        "#ffffff",
        "#46516e",
        "#858fab",
        "#b8c0d9",
        "#403631",
        "#786654",
        "#c7b48b",
        "#fff7c4",
        "#751e21",
        "#a30f11",
        "#d4151f",
        "#ff4050",
        "#995943",
        "#f28135",
        "#ffc96b",
        "#3b1c70",
        "#402c99",
        "#3952c4",
        "#6c94f0",
        "#70e5ff",
        "#6a24a8",
        "#9c45e3",
        "#c380ff",
        "#ea9efc",
        "#0a4d2d",
        "#089050",
        "#70d038",
        "#b4e448",
    ];
    // colors
    let row = document.createElement("div");
    row.classList.add("row");
    let rows = [];
    rows.push(row);
    for (var i = 0; i < colors.length; i++) {
        let color = colors[i];
        let colorButton = document.createElement("button");
        colorButton.classList.add("colorsButton");
        colorButton.style.backgroundColor = color;

        colorButton.addEventListener("click", function (event) {
            canvas.freeDrawingBrush.color = color;
            $("#colorPicker").val(color);
        });

        row.appendChild(colorButton);
        if ((i + 1) % 8 == 0) {
            row = document.createElement("div");
            row.classList.add("row");
            rows.push(row);
        }
    }
    rows.forEach((row) => {
        document.getElementById("colors").appendChild(row);
    });

    // brushes
    let brushSizes = [1, 5, 10, 20, 100];
    for (var i = 0; i < brushSizes.length; i++) {
        let size = brushSizes[i];

        let brushButton = document.createElement("button");
        brushButton.classList.add("brushButton");
        brushButton.style.display = "flex";
        brushButton.style.justifyContent = "center";
        brushButton.style.alignItems = "center";
        brushButton.style.width = "30px";
        brushButton.style.height = "30px";
        brushButton.style.padding = "0px";
        brushButton.classList.add("btn");
        brushButton.classList.add("btn-light");
        brushButton.classList.add("m-1");

        if (size != brushSizes[4]) {
            let brushDiv = document.createElement("div");
            brushDiv.style.backgroundColor = "black";
            brushDiv.style.borderRadius = "50%";
            brushDiv.style.width = size + "px";
            brushDiv.style.height = size + "px";
            brushButton.appendChild(brushDiv);
            document.getElementById("brushes").appendChild(brushButton);
            brushButton.addEventListener("click", function (event) {
                canvas.freeDrawingBrush.width = size;
                $("#brushRange").val(size);
                enableDrawing();
            });
        } else {
            brushButton.style.backgroundColor = "black";
            brushButton.style.color = "white";
            brushButton.style.fontSize = "0.7rem";
            brushButton.classList.add("whiteFont");
            brushButton.innerHTML = "MAX";
            document.getElementById("brushes").appendChild(brushButton);
            brushButton.addEventListener("click", function (event) {
                canvas.freeDrawingBrush.width = size;
                $("#brushRange").val(size);
                enableDrawing();
            });
        }
    }
}

function enableDrawing() {
    canvas.isDrawingMode = true;
    fillBucket = false;
}

function enableFillBucket() {
    canvas.isDrawingMode = false;
    fillBucket = true;
    for (var obj in canvas._objects) {
        canvas._objects[obj].selectable = false;
    }
}

function stripTrailingSlash(str) {
    if (str.substr(-1) === "/") {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function displayResults(data) {
    let content = data.content;
    let nextPlayers = data.players;
    console.log(data);

    notWaitingForPlayers();
    $("#drawCanvasDiv").addClass("d-none");
    $("#guessCanvasDiv").addClass("d-none");
    $("#submitWord").addClass("d-none");

    $("#resultDiv").removeClass("d-none");
    document.getElementById("results").style.backgroundColor = "#303030";

    let firstPlayer = true;
    for (var player in content) {
        let button = document.createElement("button");
        button.innerHTML = player;
        button.classList.add("btn");
        button.classList.add("btn-light");
        button.classList.add("m-1");
        button.id = player + "ResultButton";
        $("#resultButtons").append(button);

        button.addEventListener("click", function () {
            for (var nextPlayer in nextPlayers) {
                let nextPlayerButton = document.getElementById(
                    nextPlayer + "ResultButton"
                );
                if (nextPlayer == this.innerHTML) {
                    document
                        .getElementById(nextPlayer + "Result")
                        .classList.remove("d-none");
                    nextPlayerButton.classList.remove("btn-light");
                    nextPlayerButton.classList.add("btn-primary");
                } else {
                    document
                        .getElementById(nextPlayer + "Result")
                        .classList.add("d-none");
                    nextPlayerButton.classList.remove("btn-primary");
                    nextPlayerButton.classList.add("btn-light");
                }
            }
        });

        let playerDiv = document.createElement("div");
        playerDiv.id = player + "Result";
        document.getElementById("results").appendChild(playerDiv);
        if (firstPlayer) {
            button.classList.remove("btn-light");
            button.classList.add("btn-primary");
            firstPlayer = false;
        } else {
            playerDiv.classList.add("d-none");
        }

        let currentPlayer = player;
        for (var i = 0; i < content[player].length; i++) {
            // Word / Image: content[currentPlayer][i]
            // Name: currentPlayer
            let playerRow = document.createElement("div");
            playerRow.classList.add("d-flex");
            playerRow.classList.add("flex-row");
            playerRow.classList.add("p-3");
            playerRow.style.border = "1px solid white";

            let round = document.createElement("div");
            round.style.width = "100px";
            round.innerHTML = i;
            playerRow.appendChild(round);

            let playerName = document.createElement("div");
            playerName.style.width = "300px";
            playerName.innerHTML = currentPlayer;
            playerRow.appendChild(playerName);
            if (i % 2 == 0) {
                // Word
                let playerWord = document.createElement("div");
                playerWord.innerHTML = content[currentPlayer][i];
                playerRow.appendChild(playerWord);
            } else {
                // Image
                let imageCanvas = document.createElement("canvas");
                imageCanvas.width = 600;
                imageCanvas.height = 450;
                let imageContext = imageCanvas.getContext("2d");
                let img = new Image();
                img.onload = function () {
                    imageContext.drawImage(img, 0, 0, 600, 450);
                };
                img.src = content[currentPlayer][i];
                playerRow.appendChild(imageCanvas);
            }
            playerDiv.appendChild(playerRow);
            currentPlayer = nextPlayers[currentPlayer];
        }
    }
}

function showAlertMessage(content) {
    $("#alert-message").html(content);
    $("#alert-div").addClass("show");
    hideAlertTimer();
}

function hideAlertTimer() {
    setTimeout(function () {
        $("#alert-div").hide();
    }, 5000);
}
