var canvas = document.getElementById("drawingCanvas");
var ctx = canvas.getContext("2d");

var drawLive = document.getElementById("drawLive");

// Web Socket
const ws = new WebSocket("ws://localhost:8082");

ws.addEventListener("open", () => {
    console.log("Connected");
});

ws.addEventListener("message", (data) => {
    // https://stackoverflow.com/questions/24779288/#24787746
    let jsonData = JSON.parse(data.data);
    if (jsonData.type === "image") {
        var image = new Image();
        image.onload = function () {
            ctx.drawImage(image, 0, 0);
        };
        image.src = jsonData.image;
    } else if (jsonData.type === "circle") {
        color = jsonData.color;
        radius = jsonData.radius;
        draw([jsonData.x, jsonData.y]);
    }
});

// Drawing stuff
var radius = 5;
var color = "#FF0000";

var mousePressed = false;
var previousCursorPos = [0, 0];

$("#drawingCanvas").on("mousedown touchstart", function (e) {
    drawCircle(getCursorPosition(e));
    previousCursorPos = [e.clientX - rect.left, e.clientY - rect.top];
    mousePressed = true;
});
$("#drawingCanvas").on("mousemove touchmove", function (e) {
    if (mousePressed) {
        draw(getCursorPosition(e));
        let coordinates = getCursorPosition(e);
        if (drawLive.checked) {
            ws.send(
                JSON.stringify({
                    type: "circle",
                    x: coordinates[0],
                    y: coordinates[1],
                    color: color,
                    radius: radius,
                })
            );
        }
    }
    previousCursorPos = [e.clientX - rect.left, e.clientY - rect.top];
});
$("#drawingCanvas").on("mouseup touchend", function (e) {
    mousePressed = false;
});
// $("#drawingCanvas").on("mouseleave touchleave", function (e) {
//     mousePressed = false;
// });

function drawCircle(coords) {
    ctx.beginPath();
    ctx.arc(coords[0], coords[1], radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

function draw(coords) {
    ctx.beginPath();
    ctx.arc(coords[0], coords[1], radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

function getCursorPosition(event) {
    // https://stackoverflow.com/questions/55677/#18053642
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

function changeRadius(newRadius) {
    radius = newRadius;
}

function changeColor(newColor) {
    color = newColor;
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function sendMessage() {
    let imageData = canvas.toDataURL();
    ws.send(JSON.stringify({ type: "image", image: imageData }));
}

var colorPicker = document.getElementById("colorPicker");
colorPicker.addEventListener("change", watchColorPicker, false);
colorPicker.value = color;

function watchColorPicker(event) {
    color = event.target.value;
    console.log(color);
}
