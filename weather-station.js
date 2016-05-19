/**
 * Created by aaron on 1/17/16.
 */
var express = require('express');
var routes = require('./routes');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var Notify = require('fs.notify');
var exec = require('child_process').execSync;

var path = require('path');
var package = require('./package');

app.use('/', express.static(package.ramDiskPath));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.sockets = {};
app.locals.dataFiles = [
    package.cameraDataFile,
    package.gimbalDataFile,
    package.windVaneDataFile,
    package.anemometerDataFile
];
app.locals.fileNotifications = {};


app.get('/', function (req, res) {
    res.render('index', {title: package.name, version: package.version});
});

app.get('/gimbal', function (req, res) {
    switch (req.query.direction) {
        case 'up':
            break;
        case 'down':
            break;
        case 'right':
            break;
        case 'left':
            break;
    }
});

io.on('connection', function (socket) {
    app.locals.sockets[socket.id] = socket;

    var numbeOfClients = Object.keys(app.locals.sockets).length;
    console.log("Total clients connected : ", numbeOfClients);

    io.sockets.emit('number-of-clients-changed', numbeOfClients);

    socket.on('disconnect', function () {

        delete app.locals.sockets[socket.id];

        io.sockets.emit('number-of-clients-changed', numbeOfClients);

        if (numbeOfClients == 0)
            if (app.locals.listeningToSensors)
                _removeSensorListeners();
    });

    socket.on('start-measurement-stream', function (e) {

        socket.emit('on-start-measurement-stream', _getSensorState());
        _addSensorListeners();

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});


function _addSensorListeners() {

    if (app.locals.listeningToSensors)
        return;

    app.locals.fileNotifications = new Notify(app.locals.dataFiles);
    app.locals.fileNotifications.on('change', function (file, event, path) {

        if (path == package.cameraDataFile)
            io.sockets.emit('camera-measurement', './camera.jpg?_t=' + (Math.random() * 100000));//_getSensorState());

        console.log(path);

        if (path == package.windVaneDataFile)
            io.sockets.emit('wind-vane-measurement', _getDataJson(path));

        if (path == package.anemometerDataFile)
            io.sockets.emit('anemometer-measurement', _getDataJson(path));

        if (path == package.gimbalDataFile)
            io.sockets.emit('camera-gimbal-moved', _getDataJson(path));
    });

    app.locals.listeningToSensors = true;

}

function _removeSensorListeners() {

    if (!app.locals.listeningToSensors)
        return;

    app.locals.fileNotifications.close();
    app.locals.listeningToSensors = false;
}


function _getDataJson(file) {

    value = {}
    try {
        value = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e){
        console.log('_getDataJson error: ' + e.message)
    }
    return value}



function _getSensorState() {

    var windMPH = _getDataJson(package.anemometerDataFile);
    var windDirection = _getDataJson(package.windVaneDataFile);
    var gimbal = _getDataJson(package.gimbalDataFile)

    var image = './camera.jpg?_t=' + (Math.random() * 100000);

    var state = {
        temp: -1,
        humid: -1,
        wind: {mph: windMPH, direction: windDirection},
        //camera: {image: image, compass: gimbal.compass, pitch: gimbal.pitch, fovVertical: 53.50, fovHorizontal: 41.41}
    };

    return state;
}

//
//var files = [
//    //package.cameraDataFile,
//    package.gimbalDataFile
//];

/*
 var notifications = new Notify(files);
 notifications.on('change', function (file, event, path) {
 console.log('caught a ' + event + ' event on ' + path);
 console.log(file);
 if (event == 'change') {
 fs.readFile(package.gimbalDataFile, 'utf8', function (err, data) {

 if (err) throw err;

 gimbal = JSON.parse(data);

 exec('python /home/pi/weather-station/lib/gimbal/ServoGimbal.py 0 ' + String(gimbal.compass), function (error, stdout, stderr) {
 // command output is in stdout
 });
 exec('python /home/pi/weather-station/lib/gimbal/ServoGimbal.py 1 ' + String(gimbal.pitch), function (error, stdout, stderr) {
 // command output is in stdout
 });
 // take the pulse load off the other pins
 exec('python /home/pi/weather-station/lib/gimbal/ServoGimbal.py 3 375', function (error, stdout, stderr) {
 // command output is in stdout
 });

 });

 }
 });

 // write default package.gimbalDataFile
 fs.writeFile(package.gimbalDataFile, '{"compass": 375, "pitch": 375}', function (err) {
 if (err) return console.log(err);
 console.log('Hello World > package.gimbalDataFile');
 });
 */

//
//
//function stopStreaming() {
//    if (Object.keys(sockets).length == 0) {
//        app.set('isStreaming', false);
//        //if (proc) proc.kill();
//        fs.unwatchFile(package.ramDiskPath + '/image_stream.jpg');
//    }
//}
//
//function startStreaming(io) {
//
//    if (app.get('isStreaming')) {
//        io.sockets.emit('camera-measurement', app.locals.//'./image_stream.jpg?_t=' + (Math.random() * 100000));
//    }
//
//    app.set('isStreaming', true);
//
//    fs.watchFile(package.ramDiskPath + '/image_stream.jpg', function (current, previous) {
//        //console.log('watch hit:' + current + " : " + previous);
//        //io.sockets.emit('liveStream', './image_stream.jpg?_t=' + (Math.random() * 100000));
//    });
//}
//

///**
// * Created by aaron on 11/28/15.
// */
//var express = require('express')
//    , routes = require('./routes')
//    , http = require('http')
//    , path = require('path')
//    , gpio = require("rpi-gpio")
//    , ds18b20 = require('ds18b20')
//    , logger = require('./lib/logger');
//
//
//var app = express();
//
//app.configure(function () {
//    app.set('port', 3000);
//    app.set('views', __dirname + '/views');
//    app.set('view engine', 'jade');
//    app.use(express.favicon());
//    app.use(express.logger('dev'));
//    app.locals.ds18b20 = ds18b20;
//    app.locals.logger = logger;
//    app.locals.weather = {temp: NaN};
//    app.locals.pollingInterval = 5000;
//
//
//    app.locals.logger.init(app);
//    app.locals.logger.start();
//});
//
//app.configure('development', function () {
//    app.use(express.errorHandler());
//});
//
//
//app.get('/', function (req, res) {
//    res.render('index', {title: require('./package.json').name, port: app.get('port')});
//});
//
//app.get('/logging/start', function (req, res) {
//    app.locals.logger.start();
//    res.send('started');
//});
//
//app.get('/logging/stop', function (req, res) {
//    app.locals.logger.stop();
//    res.send('stopped');
//});
//
//
//app.get('/current-temp', function (req, res) {
//    var log = app.locals.logger.log();
//    var current = log[log.length - 1].temp;
//    var high = 0;
//    var low = 0;
//
//    if (log.length == 1) {
//        high = log[0].temp;
//        low = log[0].temp;
//    } else {
//        for (var i = 0; i < log.length; i++) {
//            if (log[i].temp >= high) {
//                high = log[i].temp;
//            }
//
//            if (log[i].temp <= low) {
//                low = log[i].temp;
//            }
//        }
//    }
//
//
//    res.send(String(current) + 'c : ' + String(current * 1.8 + 32) + 'f<br>' +
//        'high: ' + String(high) + '<br>' +
//        'low: ' + String(low));
//
//
//});
//
//http.createServer(app).listen(app.get('port'), function () {
//    console.log("Express server listening on port " + app.get('port'));
//});
//
