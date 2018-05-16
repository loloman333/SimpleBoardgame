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
    redStones:[  ],
    blueStones:[ ],
    yellowStones:[  ],   
    greenStones:[  ]  
};

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

    let color;

    console.log('a user connected');
    gameInfo.onlineUsers += 1;
    io.emit('gameStatus', gameInfo);

    socket.on('disconnect', function () {
        console.log('user disconnected');
        gameInfo.onlineUsers -= 1;

        if (color){        
            switch(color){
                case 'red': 
                    console.log('Bye, ' + gameInfo.red + '! (Player ' + color + ')');
                    gameInfo.red = ''; 
                    break;
                case 'blue': 
                    console.log('Bye, ' + gameInfo.blue + '! (Player ' + color + ')');
                    gameInfo.blue = ''; 
                    break;
                case 'yellow': 
                    console.log('Bye, ' + gameInfo.yellow + '! (Player ' + color + ')');
                    gameInfo.yellow = ''; 
                    break;
                case 'green': 
                    console.log('Bye, ' + gameInfo.green + '! (Player ' + color + ')');
                    gameInfo.green = ''; 
                    break;
            }
        }

        io.emit('gameStatus', gameInfo);
    });

    socket.on('chooseColor', function (msg) {

        console.log(msg.name + " is now Player " + msg.color);
        color = msg.color;
        
        switch(msg.color){
            case "'red'": 
                console.log("yea")
                gameInfo.red = msg.name; break;
            case 'blue': gameInfo.blue = msg.name; break;
            case 'yellow': gameInfo.yellow = msg.name; break;
            case 'green': gameInfo.green = msg.name; break;
        }

        console.log(gameInfo);
        io.emit('gameStatus', gameInfo);

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});