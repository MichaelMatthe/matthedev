// base on https://github.com/williammalone/HTML5-Paint-Bucket-Tool/blob/master/html5-canvas-paint-bucket.js

var fillBucket = false;

var colorLayerData;
var fillColor;

var canvasWidth;
var canvasHeight;

var drawingAreaX = 0;
var drawingAreaY = 0;
var drawingAreaWidth;
var drawingAreaHeight;

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

    let tolerance = 0;

    // If the current pixel matches the clicked color
    if (
        r <= startR + tolerance &&
        r >= startR - tolerance &&
        g <= startG + tolerance &&
        g >= startG - tolerance &&
        b <= startB + tolerance &&
        b >= startB - tolerance
    ) {
        return true;
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

function fillCollorAtCoords(xCoord, yCoord, tmpColorLayerData, width, height) {
    let tmpCanvas = document.createElement("canvas");
    let tmpContext = tmpCanvas.getContext("2d");
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    colorLayerData = tmpColorLayerData;

    fillColor = hexToRgb(canvas.freeDrawingBrush.color);
    paintAt(xCoord, yCoord);
    tmpContext.putImageData(colorLayerData, 0, 0);
    fabric.Image.fromURL(tmpCanvas.toDataURL(), function (myImg) {
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
    });
}

function colorAt(x, y) {
    var pixelPos = (y * canvasWidth + x) * 4;
    return {
        r: colorLayerData.data[pixelPos],
        g: colorLayerData.data[pixelPos + 1],
        b: colorLayerData.data[pixelPos + 2],
    };
}

function initFillBucket() {
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    drawingAreaWidth = canvas.width;
    drawingAreaHeight = canvas.height;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}
