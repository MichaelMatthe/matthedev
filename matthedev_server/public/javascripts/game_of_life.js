var canvas;
var context;

var grid;

var gridWidth = 50;
var gridHeight = 50;

var tileWidth = 15;
var tileHeight = 15;

var updateRate = 100;
var animationActive = true;

var timeOut;

$(document).ready(function () {
    initButtons();

    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.canvas.width = gridWidth * tileWidth;
    context.canvas.height = gridHeight * tileHeight;
    initGrid();

    renderGrid();
    timeOut = setTimeout(loop, updateRate);
});

function pauseAnimation() {
    clearTimeout(timeOut);
}

function playAnimation() {
    timeout = setTimeout(loop, updateRate);
}

function initButtons() {
    document
        .getElementById("playButton")
        .addEventListener("click", function () {
            if (animationActive) {
                pauseAnimation();
                document.getElementById("playButton").innerHTML =
                    '<i class="fas fa-play"></i>';
                animationActive = false;
            } else {
                playAnimation();
                document.getElementById("playButton").innerHTML =
                    '<i class="fas fa-pause"></i>';
                animationActive = true;
            }
        });

    document
        .getElementById("gliderGunButton")
        .addEventListener("click", function () {
            initGliderGun();
            renderGrid();
        });

    document
        .getElementById("clearButton")
        .addEventListener("click", function () {
            initGrid();
            renderGrid();
        });

    document
        .getElementById("animationSpeed")
        .addEventListener("input", function () {
            updateRate =
                document.getElementById("animationSpeed").value * -1 + 510;
        });

    document
        .getElementById("canvas")
        .addEventListener("click", function (event) {
            if (!animationActive) {
                let x = Math.floor(
                    (event.pageX - canvas.offsetLeft) / tileWidth
                );
                let y = Math.floor(
                    (event.pageY - canvas.offsetTop) / tileHeight
                );
                grid[y][x] = Math.abs(grid[y][x] - 1);
                renderGrid();
            }
        });
}

function initGrid() {
    grid = [];
    for (var y = 0; y < gridHeight; y++) {
        let row = [];
        for (var x = 0; x < gridWidth; x++) {
            row.push(0);
        }
        grid.push(row);
    }
}

function loop() {
    update();
    renderGrid();
    timeOut = setTimeout(loop, updateRate);
}

function update() {
    let tempGrid = [];
    for (var y = 0; y < gridHeight; y++) {
        let temp_row = [];
        for (var x = 0; x < gridWidth; x++) {
            let neighbors = countAliveNeighbors(x, y);
            if (grid[y][x] == 1 && neighbors < 2) {
                temp_row.push(0);
            } else if (grid[y][x] == 1 && neighbors >= 2 && neighbors <= 3) {
                temp_row.push(1);
            } else if (grid[y][x] == 1 && neighbors > 3) {
                temp_row.push(0);
            } else if (grid[y][x] == 0 && neighbors == 3) {
                temp_row.push(1);
            } else {
                temp_row.push(0);
            }
        }
        tempGrid.push(temp_row);
    }
    grid = tempGrid;
}

function renderGrid() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, gridWidth * tileWidth, gridHeight * tileHeight);
    context.fillStyle = "#000000";
    context.strokeStyle = "#202020";
    for (var y = 0; y < gridHeight; y++) {
        for (var x = 0; x < gridWidth; x++) {
            if (grid[y][x]) {
                context.fillRect(
                    x * tileWidth,
                    y * tileHeight,
                    tileWidth,
                    tileHeight
                );
            }

            context.beginPath();
            context.rect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            context.stroke();
        }
    }
}

function countAliveNeighbors(x, y) {
    let x_low = x - 1 >= 0 ? x - 1 : 0;
    let x_high = x + 1 <= gridWidth - 1 ? x + 1 : gridWidth - 1;
    let y_low = y - 1 >= 0 ? y - 1 : 0;
    let y_high = y + 1 <= gridHeight - 1 ? y + 1 : gridHeight - 1;

    // subtract own cell
    let neighborSum = -grid[y][x];
    for (var y_t = y_low; y_t <= y_high; y_t++) {
        for (var x_t = x_low; x_t <= x_high; x_t++) {
            neighborSum += grid[y_t][x_t];
        }
    }
    return neighborSum;
}

function initGliderGun() {
    let pattern = [
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
        ],
        [
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
        [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ],
    ];

    grid = [];
    for (var y = 0; y < gridHeight; y++) {
        let row = [];
        for (var x = 0; x < gridWidth; x++) {
            row.push(0);
        }
        grid.push(row);
    }

    for (var y = 0; y < pattern.length; y++) {
        for (var x = 0; x < pattern[y].length; x++) {
            grid[y][x] = pattern[y][x];
        }
    }
}
