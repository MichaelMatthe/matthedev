var canvas = new fabric.Canvas("testCanvas");
canvas.add(
    new fabric.Rect({
        left: 0,
        top: 0,
        fill: "white",
        width: 200,
        height: 200,
    })
);

canvas.on("mouse:down", function (options) {
    console.log(canvas.getContext().getImageData(0, 0, 200, 200));
    console.log(options);
    const context = canvas.getContext();
    const imgData = canvas.getContext().getImageData(0, 0, 200, 200);
    const data = imgData.data;
    for (var i = 0; i < 1000; i++) {
        data[i * 4] = 0;
        data[i * 4 + 1] = 0;
        data[i * 4 + 2] = 0;
        data[i * 4 + 3] = 255;
    }
    context.putImageData(imgData, 0, 0);
    console.log(canvas.getContext().getImageData(0, 0, 200, 200));
});
