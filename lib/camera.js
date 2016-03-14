var raspicam = require("raspicam");
var package = require('../package');

var fs = require('fs');

var gimbal = {};

var defaultConfig = {
    mode: "timelapse",
    output: package.cameraDataFile, //filename,//"./timelapse/image_%06d.jpg", // image_000001.jpg, image_000002.jpg,...
    encoding: "jpg",
    timelapse: 10,
    timeout: 864000000, // 10 days.
    vf: true,
    hf: true,
    quality: 10,
    width: 2592 / 1,
    height: 1944 / 1,
    ex: "auto"//"night"
};


var camera = new raspicam(defaultConfig);

camera.on("exit", function (timestamp) {
    console.log("stopped");
    //stopRecording();
});

camera.start();

