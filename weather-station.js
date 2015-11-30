/**
 * Created by aaron on 11/28/15.
 */
var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , gpio = require("rpi-gpio")
    , ds18b20 = require('ds18b20')
    , logger = require('./lib/logger');


var app = express();

app.configure(function () {
    app.set('port', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.locals.ds18b20 = ds18b20;
    app.locals.logger = logger;
    app.locals.weather = {temp: NaN};
    app.locals.pollingInterval = 1000;


    app.locals.logger.init(app);
    app.locals.logger.start();
});

app.configure('development', function () {
    app.use(express.errorHandler());
});


app.get('/', function (req, res) {
    res.render('index', {title: require('./package.json').name, port: app.get('port')});
});

app.get('/logging/start', function (req, res) {
    app.locals.logger.start();
    res.send('started');
});

app.get('/logging/stop', function (req, res) {
    app.locals.logger.stop();
    res.send('stopped');
});

app.get('/current-temp', function (req, res) {
    var log = app.locals.logger.log();
    console.log(log[log.length-1].temp)
    res.send(String(log[log.length-1].temp) + 'c : ' + String(log[log.length-1].temp * 1.8 + 32) + 'f');

});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

