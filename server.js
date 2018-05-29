const express = require('express')

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameInfo = {
    running: false,
    onlineUsers: 0,
    turn: null,
    red: null,
    blue: null,
    yellow: null,
    green: null,
    redStones:[ ],
    blueStones:[ ],
    yellowStones:[  ],   
    greenStones:[  ]  
};

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Wenn ein User connected... 
io.on('connection', function (socket) {

    let color;  //farbe des spielers

    console.log('a user connected');
    gameInfo.onlineUsers += 1;
    io.emit('gameStatus', gameInfo);    //erstmalig gameInfo schicken

    // Wenn der User disconnected...
    socket.on('disconnect', function () {
        console.log('user disconnected');
        gameInfo.onlineUsers -= 1;

        //wenn der user eine farbe hatte -> farbe freigeben
        if (color){        
            switch(color){
                case 'red': 
                    console.log('Bye, ' + gameInfo.red + '! (Player ' + color + ')');
                    gameInfo.red = null; 
                    break;
                case 'blue': 
                    console.log('Bye, ' + gameInfo.blue + '! (Player ' + color + ')');
                    gameInfo.blue = null; 
                    break;
                case 'yellow': 
                    console.log('Bye, ' + gameInfo.yellow + '! (Player ' + color + ')');
                    gameInfo.yellow = null 
                    break;
                case 'green': 
                    console.log('Bye, ' + gameInfo.green + '! (Player ' + color + ')');
                    gameInfo.green = null; 
                    break;
            }
        }

        io.emit('gameStatus', gameInfo);    // andere user benachrichtigen
    });

    // Wenn der user eine farbe ausgesucht hat
    socket.on('chooseColor', function (msg) {

        console.log(msg.name + " is now Player " + msg.color);
        color = msg.color;
        
        // setzte den user in die gameInfo ein
        switch(msg.color){
            case 'red': gameInfo.red = msg.name; break;
            case 'blue': gameInfo.blue = msg.name; break;
            case 'yellow': gameInfo.yellow = msg.name; break;
            case 'green': gameInfo.green = msg.name; break;
        }

        console.log(gameInfo);
        io.emit('gameStatus', gameInfo);    //gameInfo an alle

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});