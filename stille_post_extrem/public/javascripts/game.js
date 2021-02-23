var canvas;
var boundings;
var context;
var guessContext;

var socket;
var query;

var lobbyName;
var playerName;

var lobbyPlayers;

window.onload = function () {
    $("#addButton").click(function () {
        $("#testDiv").addClass("d-none");
    });

    $("#removeButton").click(function () {
        $("#testDiv").removeClass("d-none");
    });

    // Definitions
    canvas = document.getElementById("paint-canvas");
    context = canvas.getContext("2d");
    boundings = canvas.getBoundingClientRect();

    guessCanvas = document.getElementById("guess-canvas");
    guessContext = guessCanvas.getContext("2d");

    // Specifications
    var mouseX = 0;
    var mouseY = 0;
    context.strokeStyle = "black"; // initial brush color
    context.lineWidth = 1; // initial brush width
    var isDrawing = false;

    // Handle Colors
    var colors = document.getElementsByClassName("colors")[0];

    colors.addEventListener("click", function (event) {
        context.strokeStyle = event.target.value || "black";
    });

    // Handle Brushes
    var brushes = document.getElementsByClassName("brushes")[0];

    brushes.addEventListener("click", function (event) {
        context.lineWidth = event.target.value || 1;
    });

    // Mouse Down Event
    canvas.addEventListener("mousedown", function (event) {
        setMouseCoordinates(event);
        isDrawing = true;

        // Start Drawing
        context.beginPath();
        context.moveTo(mouseX, mouseY);
    });

    // Mouse Move Event
    canvas.addEventListener("mousemove", function (event) {
        setMouseCoordinates(event);

        if (isDrawing) {
            context.lineTo(mouseX, mouseY);
            context.stroke();
        }
    });

    // Mouse Up Event
    canvas.addEventListener("mouseup", function (event) {
        setMouseCoordinates(event);
        isDrawing = false;
    });

    canvas.addEventListener("mouseleave", function (event) {
        isDrawing = false;
    });

    // Handle Mouse Coordinates
    function setMouseCoordinates(event) {
        mouseX = event.clientX - boundings.left;
        mouseY = event.clientY - boundings.top;
    }

    // Handle Clear Button
    var clearButton = document.getElementById("clear");

    clearButton.addEventListener("click", function () {
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });

    // update join / create lobby button
    query = window.location.href.split("/")[3];
    let lobbyButton = document.getElementById("joinButton");
    if (query != "") {
        console.log("change");
        lobbyButton.innerHTML = "Join Lobby";
        lobbyButton.onclick = joinLobby;
    } else {
        lobbyButton.innerHTML = "Create Lobby";
        lobbyButton.onclick = createLobby;
    }

    $("#nameForm").on("submit", function (e) {
        e.preventDefault();
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
    socket = io.connect("192.168.0.7:8040", {
        reconnect: true,
        transports: ["websocket"],
        forceNew: true,
    });

    socket.on("connect", function (data) {
        console.log("connected");
    });

    socket.on("joinLobby", function (data) {
        lobbyName = data.lobbyId;
        lobbyPlayers = data.players;
        data.players.forEach((player) => {
            $("#players").append("<div>" + player + "</div>");
        });
        $("#lobbyId").html(
            window.location.href.split("/").splice(0, 3).join("/") +
                "/?" +
                data.lobbyId
        );
        $("#lobbyIdInput").val(
            window.location.href.split("/").splice(0, 3).join("/") +
                "/?" +
                data.lobbyId
        );

        $("#lobbyCreator").addClass("d-none");
        $("#lobby").removeClass("d-none");
        console.log("Lobby joined", data);
    });

    socket.on("playerJoinsLobby", function (data) {
        console.log(data.name);
        lobbyPlayers.push(data.name);
        $("#players").append("<div>" + data.name + "</div>");
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
            row.appendChild(nameDiv);

            if (i < players.length - 1) {
                let arrowDiv = document.createElement("img");
                arrowDiv.src = "images/arrow.svg";
                arrowDiv.width = "30";
                arrowDiv.height = "30";
                arrowDiv.classList.add("right");
                row.appendChild(arrowDiv);
            }
        }
        $("#playerOrder").append(row);
        $("#lobby").addClass("d-none");
        $("#playerOrder").removeClass("d-none");
        $("#gameDiv").removeClass("d-none");
        $("#submitWord").removeClass("d-none");
    });

    socket.on("playerSubmitted", function (data) {
        document.getElementById(
            data.name + "SubmittedCircle"
        ).style.backgroundColor = "#32a852";
    });

    socket.on("startDrawRound", function (data) {
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        $("#guessWord").html(data.word);
        console.log("Start Draw Round", data);
        resetSubmitCircles();
        $("#submitWord").addClass("d-none");
        $("#guessCanvasDiv").addClass("d-none");
        $("#drawCanvasDiv").removeClass("d-none");
        resize();
    });

    socket.on("startGuessRound", function (data) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Start Guess Round", data);
        let image = new Image();
        image.onload = function () {
            guessContext.drawImage(image, 0, 0);
        };
        image.src = data.image;
        resetSubmitCircles();
        $("#drawCanvasDiv").addClass("d-none");
        $("#guessCanvasDiv").removeClass("d-none");
        resize();
    });
};

function resize() {
    boundings = canvas.getBoundingClientRect();
}

function createLobby() {
    if ($("#nameInput").val() != "") {
        console.log("create lobby");
        playerName = $("#nameInput").val();
        $("#startButton").removeClass("d-none");
        socket.emit("createLobby", { name: playerName });
    } else {
        console.log("enter name");
    }
}

function joinLobby() {
    if ($("#nameInput").val() != "") {
        console.log("join lobby");
        playerName = $("#nameInput").val();
        socket.emit("joinLobby", {
            name: playerName,
            lobbyId: query.replace("?", ""),
        });
    } else {
        console.log("enter name");
    }
}

function startGame() {
    socket.emit("startGame", { lobbyId: lobbyName });
}

function submitWord() {
    let word = $("#submitWordInput").val();
    socket.emit("submitWord", {
        player: playerName,
        lobbyId: lobbyName,
        word: word,
    });
    $("#submitWord").addClass("d-none");
}

function submitDraw() {
    socket.emit("submitDrawing", {
        player: playerName,
        lobbyId: lobbyName,
        image: canvas.toDataURL(),
    });
}

function submitGuess() {
    // TODO clear input field
    socket.emit("submitGuess", {
        player: playerName,
        lobbyId: lobbyName,
        word: $("#guessInput").val(),
    });

    $("#guessInput").val("");
}

function resetSubmitCircles() {
    lobbyPlayers.forEach((player) => {
        document.getElementById(
            player + "SubmittedCircle"
        ).style.backgroundColor = "#8a8a8a";
    });
}
