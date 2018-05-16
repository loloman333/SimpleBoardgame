const express = require('express')

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var clicks = 0;

app.use(express.static(__dirname + '/public'))


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    console.log('a user connected');

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('clickup', function (msg) {
        console.log("Add 1 to Clickcount | Current: " + clicks);
        clicks += 1;
        io.emit("clickcount", clicks);
    });

    io.emit('clickcount', clicks);

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});