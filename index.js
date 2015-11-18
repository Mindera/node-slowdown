var restify = require('restify');

// Default values
var defaultPort = 8080;
var defaultMaxMillis = 300000;

function respond(req, res, next) {
    var millis = parseInt(req.params.millis);
    var response = req.params.response;

    if (!isMillisValid(millis) || !isResponseValid(response)) {
        res.send(400);
    } else {
        setTimeout(function () {
            res.send(response);
        }, millis);
    }
    next();
}

function isMillisValid(millis) {
    return !isNaN(millis) && millis < defaultMaxMillis;
}

function isResponseValid(response) {
    return typeof response != 'undefined';
}

function getPortParam() {
    var portArg = process.argv[2];
    if (portArg) {
        return portArg;
    } else {
        return defaultPort
    }
}

var server = restify.createServer();
server.get('/slowdown/:millis/:response', respond);

server.listen(getPortParam(), function() {
    console.log('%s listening at %s', server.name, server.url);
});