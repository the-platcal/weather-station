/**
 * Created by aaron on 11/29/15.
 */
var _app;
var _log = [];

exports.init = function (app) {
    _app = app;
};

exports.start = function () {

    _app.locals.logging = true;

    var recursive = function () {
        if (_app.locals.logging) {
            var id;
            _app.locals.ds18b20.sensors(function (err, ids) {
                id = ids[0];
                _app.locals.ds18b20.temperature(id, function (err, value) {

                    _log.push({date: Number(new Date()), temp: value});

                    setTimeout(recursive, _app.locals.pollingInterval);
                });
            });
        }
    };
    recursive();
};

exports.stop = function () {
    _app.locals.logging = false;
};

exports.log = function () {
    return _log;
};
