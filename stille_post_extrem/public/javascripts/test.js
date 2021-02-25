var canvas = new fabric.Canvas("testCanvas");

var tmpCanvas = document.createElement("canvas");
var tmpContext = tmpCanvas.getContext("2d");
tmpCanvas.width = 100;
tmpCanvas.height = 100;

tmpContext.fillStyle = "#00FF00";
tmpContext.fillRect(10, 10, 50, 50);

var imgData = tmpContext.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
var data = imgData.data;
for (var i = 0; i < 1000; i++) {
    data[i * 4] = 0;
    data[i * 4 + 1] = 128;
    data[i * 4 + 2] = 0;
    data[i * 4 + 3] = 255;
}

var img = new Image();
img.onload = function () {
    canvas.add(
        new fabric.Image(img, {
            left: 0,
            top: 0,
            selectable: false,
        })
    );
};
img.src = tmpCanvas.toDataURL("image/png");

console.log(canvas);

// var fImage = fabric.Image(tmpCanvas);

//canvas.add(fImage).renderAll();

pixelStack = [[startX, startY]];

while (pixelStack.length) {
    var newPos, x, y, pixelPos, reachLeft, reachRight;
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];

    pixelPos = (y * canvasWidth + x) * 4;
    while (y-- >= drawingBoundTop && matchStartColor(pixelPos)) {
        pixelPos -= canvasWidth * 4;
    }
    pixelPos += canvasWidth * 4;
    ++y;
    reachLeft = false;
    reachRight = false;
    while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
            if (matchStartColor(pixelPos - 4)) {
                if (!reachLeft) {
                    pixelStack.push([x - 1, y]);
                    reachLeft = true;
                }
            } else if (reachLeft) {
                reachLeft = false;
            }
        }

        if (x < canvasWidth - 1) {
            if (matchStartColor(pixelPos + 4)) {
                if (!reachRight) {
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
context.putImageData(colorLayer, 0, 0);

function matchStartColor(pixelPos) {
    var r = colorLayer.data[pixelPos];
    var g = colorLayer.data[pixelPos + 1];
    var b = colorLayer.data[pixelPos + 2];

    return r == startR && g == startG && b == startB;
}

function colorPixel(pixelPos) {
    colorLayer.data[pixelPos] = fillColorR;
    colorLayer.data[pixelPos + 1] = fillColorG;
    colorLayer.data[pixelPos + 2] = fillColorB;
    colorLayer.data[pixelPos + 3] = 255;
}
