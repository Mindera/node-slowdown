var restify = require('restify');
var random = require('randomstring');
var errors = require('restify-errors');

// Default values
var defaultPort = 8080;
var defaultMaxMillis = 300000;

var maxByteSize = 1048576;
var megaByteString = random.generate(maxByteSize);

function respondMimic(req, res, next) {
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

function respondRandom(req, res, next) {
    var millis = parseInt(req.params.millis);
    var size = req.params.size;

    if (!isMillisValid(millis) || !isSizeValid(size)) {
        res.send(400);
    } else {
        setTimeout(function () {
            var bytes = convertToBytes(size);
            res.send(megaByteString.substring(0, bytes));
        }, millis);
    }
    next();
}

function isMillisValid(millis) {
    return !isNaN(millis) && millis < defaultMaxMillis;
}

function isSizeValid(size) {
    if (parseInt(size) > maxByteSize) {
        return false;
    } else {
        return /(1M)|(1000K)|(^\d{1,3}K?$)|\d+/.test(size);
    }
}

function convertToBytes(size) {
    var multiplier = getMultiplier(size);
    var value = parseInt(size.match(/\d+/));

    switch (multiplier) {
        case 'K':
            return value * 1024;
            break;
        case 'M':
            return value * maxByteSize;
            break;
        default:
            return value;
    }
}

function getMultiplier(size) {
    var multiplier = size.match(/[KM]/);
    if (multiplier !== null) {
        return multiplier[0];
    }
    return '';
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
server.get('/slowdown/:millis/:response', respondMimic);
server.get('/slowdown-random/:millis/:size', respondRandom);

server.listen(getPortParam(), function() {
    console.log('%s listening at %s', server.name, server.url);
});