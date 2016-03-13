/**
 * Created by aaron on 1/17/16.
 */
var express = require('express');
var routes = require('./routes');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var pkg = require('./package');

app.use('/', express.static(pkg.ramDiskPath));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


//app.get('/', function(req, res) {
//    res.sendFile(__dirname + '/index.html');
//    //console.log(path.join(__dirname, '/stream'));
//});

app.get('/', function (req, res) {
    res.render('index', {title: pkg.name, version: pkg.version});
});

app.locals.sensorsState = {temp: 22, humid: 0.8, camera: 'image.jpg', gimbal: {heading: 272, pitch: -20}};

app.get('/state', function (req, res) {
    res.send(JSON.stringify(app.locals.sensorsState, null, "\t"));

});

var sockets = {};

io.on('connection', function (socket) {
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);

    socket.on('disconnect', function () {
        delete sockets[socket.id];
        console.log('socket.on disconnect');
        console.log("Total clients connected : ", Object.keys(sockets).length);

        stopStreaming();

        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            app.set('isStreaming', false);
            //if (proc) proc.kill();
            fs.unwatchFile(pkg.ramDiskPath + '/image_stream.jpg');
        }
    });

    socket.on('start-stream', function () {
        startStreaming(io);
    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('isStreaming', false);
        //if (proc) proc.kill();
        fs.unwatchFile(pkg.ramDiskPath + '/image_stream.jpg');
    }
}

function startStreaming(io) {

    if (app.get('isStreaming')) {
        io.sockets.emit('liveStream', './image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }

    app.set('isStreaming', true);

    fs.watchFile(pkg.ramDiskPath + '/image_stream.jpg', function (current, previous) {
        //console.log('watch hit:' + current + " : " + previous);
        io.sockets.emit('liveStream', './image_stream.jpg?_t=' + (Math.random() * 100000));
    });
}


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
//    res.render('index', {title: require('./pkg.json').name, port: app.get('port')});
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
