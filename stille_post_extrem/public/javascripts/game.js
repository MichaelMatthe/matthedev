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

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Create color buttons
    setUpColors();

    guessCanvas = document.getElementById("guess-canvas");
    guessContext = guessCanvas.getContext("2d");

    // Specifications
    var mouseX = 0;
    var mouseY = 0;
    context.strokeStyle = "black"; // initial brush color
    context.lineWidth = 1; // initial brush width
    var isDrawing = false;

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
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        $("#guessWord").html(data.word);
        console.log("Start Draw Round", data);
        resetSubmitCircles();
        showDrawing();
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
        showGuessing();
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
        "#1a1a1a",
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
            context.strokeStyle = color;
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

    document.getElementById("brushes").style.width = "20px";
    [1, 5, 10, 20].forEach((size) => {
        let brushButton = document.createElement("button");
        brushButton.classList.add("brushButton");
        brushButton.classList.add("row");
        brushButton.style.display = "flex";
        brushButton.style.justifyContent = "center";
        brushButton.style.alignItems = "center";

        let brushDiv = document.createElement("div");
        brushDiv.style.backgroundColor = "black";
        brushDiv.style.borderRadius = "50%";
        brushDiv.style.width = size + "px";
        brushDiv.style.height = size + "px";
        brushButton.appendChild(brushDiv);
        document.getElementById("brushes").appendChild(brushButton);
        brushButton.addEventListener("click", function (event) {
            context.lineWidth = size;
        });
    });

    // TODO Eraser
}
