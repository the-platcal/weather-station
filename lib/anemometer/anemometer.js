/**
 * Created by aaron on 3/8/16.
 */
var gpio = require('rpi-gpio');
var fs = require('fs');
var previousWindSpeed = -1;

gpio.setMode(gpio.MODE_BCM);
gpio.setup('21', 'in', gpio.EDGE_BOTH, function (error) {
    if (error)
        console.log(error)
});

var counter = 0;
gpio.on('change', function (channel, value) {
    // 2 changes to a true value represent 1 rotation
    if (channel == '21' && value == true)
        counter += 0.5;
});

var lengthOfSample = 2000;
function tick() {
    setTimeout(function () {
        // 60hz = 102.5 mph
        var windSpeed = counter / (lengthOfSample / 1000) * (102.5 / 60);
        console.log(windSpeed);
        if (windSpeed != previousWindSpeed)
            fs.writeFile('/ram/anemometer.json', windSpeed);

        counter = 0;
        previousWindSpeed = windSpeed;
        tick();
    }, lengthOfSample);
}

tick();