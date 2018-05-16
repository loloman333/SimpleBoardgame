const express = require('express')

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameInfo = {
    running: false,
    onlineUsers: 0,
    turn: "",
    red: "",
    blue: "",
    yellow: "",
    green: "",
    redStones:[ "", "", "", "" ],
    blueStones:[ "", "", "", "" ],
    yellowStones:[ "", "", "", "" ],   
    greenStones:[ "", "", "", "" ]  
};

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    console.log('a user connected');
    gameInfo.onlineUsers += 1;
    io.emit('gameStatus', gameInfo);

    socket.on('disconnect', function () {
        console.log('user disconnected');
        gameInfo.onlineUsers -= 1;
        io.emit('gameStatus', gameInfo);
    });

    socket.on('choseColor', function (msg) {
        console.log("Socket " + socket.id + " is now Player " + msg);
        switch(msg){
            case 'red': gameInfo.red = socket.id; break;
            case 'blue': gameInfo.blue = socket.id; break;
            case 'yellow': gameInfo.yellow = socket.id; break;
            case 'green': gameInfo.green = socket.id; break;
        }
        io.emit('gameStatus', gameInfo);

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});