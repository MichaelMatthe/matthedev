var canvas = new fabric.Canvas("testCanvas", {
    selection: false,
    isDrawingMode: true,
});
canvas.freeDrawingBrush.width = 20;

var fillBucket = false;

canvas.add(
    new fabric.Rect({
        left: 0,
        top: 0,
        fill: "white",
        width: canvas.width,
        height: canvas.height,
    })
);

var colorLayerData;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var fillColor = {
    r: 255,
    g: 0,
    b: 0,
};

var drawingAreaX = 0;
var drawingAreaY = 0;
var drawingAreaWidth = canvas.width;
var drawingAreaHeight = canvas.height;

function floodFill(startX, startY, startR, startG, startB) {
    var newPos,
        x,
        y,
        pixelPos,
        reachLeft,
        reachRight,
        drawingBoundLeft = drawingAreaX,
        drawingBoundTop = drawingAreaY,
        drawingBoundRight = drawingAreaX + drawingAreaWidth - 1,
        drawingBoundBottom = drawingAreaY + drawingAreaHeight - 1,
        pixelStack = [[startX, startY]];

    while (pixelStack.length) {
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        // Get current pixel position
        pixelPos = (y * canvasWidth + x) * 4;

        // Go up as long as the color matches and are inside the canvas
        while (
            y >= drawingBoundTop &&
            matchStartColor(pixelPos, startR, startG, startB)
        ) {
            y -= 1;
            pixelPos -= canvasWidth * 4;
        }

        pixelPos += canvasWidth * 4;
        y += 1;
        reachLeft = false;
        reachRight = false;

        // Go down as long as the color matches and is inside the canvas
        while (
            y <= drawingBoundBottom &&
            matchStartColor(pixelPos, startR, startG, startB)
        ) {
            y += 1;

            colorPixel(pixelPos, fillColor.r, fillColor.g, fillColor.b);

            if (x > drawingBoundLeft) {
                if (matchStartColor(pixelPos - 4, startR, startG, startB)) {
                    if (!reachLeft) {
                        // Add pixel to stack
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }

            if (x < drawingBoundRight) {
                if (matchStartColor(pixelPos + 4, startR, startG, startB)) {
                    if (!reachRight) {
                        // Add pixel to stack
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }

            pixelPos += canvasWidth * 4;
        }
    }
}

function matchStartColor(pixelPos, startR, startG, startB) {
    r = colorLayerData.data[pixelPos];
    g = colorLayerData.data[pixelPos + 1];
    b = colorLayerData.data[pixelPos + 2];

    // If the current pixel matches the clicked color
    if (r === startR && g === startG && b === startB) {
        return true;
    }

    // If current pixel matches the new color
    if (r === fillColor.r && g === fillColor.g && b === fillColor.b) {
        return false;
    }

    return false;
}

function colorPixel(pixelPos, r, g, b, a) {
    colorLayerData.data[pixelPos] = r;
    colorLayerData.data[pixelPos + 1] = g;
    colorLayerData.data[pixelPos + 2] = b;
    colorLayerData.data[pixelPos + 3] = a !== undefined ? a : 255;
}

function paintAt(startX, startY) {
    var pixelPos = (startY * canvasWidth + startX) * 4;
    var r = colorLayerData.data[pixelPos];
    var g = colorLayerData.data[pixelPos + 1];
    var b = colorLayerData.data[pixelPos + 2];
    if (r === fillColor.r && g === fillColor.g && b === fillColor.b) {
        // Return because trying to fill with the same color
        return;
    }

    floodFill(startX, startY, r, g, b);
}

function fillCollorAtCoords(xCoord, yCoord, fillColorTmp, width, height) {
    let tmpCanvas = document.createElement("canvas");
    let tmpContext = tmpCanvas.getContext("2d");
    tmpCanvas.width = width;
    tmpCanvas.height = height;

    fillColor = fillColorTmp;
    paintAt(xCoord, yCoord);
    tmpContext.putImageData(colorLayerData, 0, 0);
    const fImage = fabric.Image.fromURL(
        tmpCanvas.toDataURL(),
        function (myImg) {
            //i create an extra var for to change some image properties
            var img1 = myImg.set({
                left: 0,
                top: 0,
                width: canvasWidth,
                height: canvasHeight,
                selectable: false,
            });
            canvas.add(img1);
            canvas.renderAll();
        }
    );

    //canvas.add(fImage);

    // return fabric js image
}

$(document).ready(function () {
    canvas.on("mouse:down", function (options) {
        if (fillBucket) {
            colorLayerData = document
                .getElementById("testCanvas")
                .getContext("2d")
                .getImageData(0, 0, canvasWidth, canvasHeight);

            fillCollorAtCoords(
                options.e.offsetX,
                options.e.offsetY,
                fillColor,
                canvas.width,
                canvas.height,
                canvas.data
            );
        }
    });

    document.addEventListener("keydown", keyDownHandler, false);

    function keyDownHandler(e) {
        if (e.key == "q") {
            console.log("fillBucket", fillBucket);
            canvas.isDrawingMode = false;
            fillBucket = true;
            for (var obj in canvas._objects) {
                canvas._objects[obj].selectable = false;
            }
        } else if (e.key == "w") {
            console.log("Drawing");
            canvas.isDrawingMode = true;
            fillBucket = false;
        }
    }
});
