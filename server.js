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
    redStones:["hr1", "hr2", "hr3", "hr4"],
    blueStones:["hb1","hb2", "hb3", "hb4" ],
    yellowStones:["hy1", "hy2", "hy3", "hy4"],   
    greenStones:["hg1", "hg2", "hg3", "hg4"]  
};

var redStart = "f10";
var blueStart = "f3";
var greenStart = "f31";
var yellowStart = "38";

var redEnd = "f20";
var blueEnd = "f2";
var greenEnd = "f21";
var yellowEnd = "f39";

var order = ["f1" , "f2" , "f3" , "f5" , "f7" , "f9" , "f15", "f16", "f17", "f18", "f19", "f21",
             "f31", "f30", "f29", "f28", "f27", "f33", "f35", "f37", "f40", "f39", "f38", "f36",
             "f34", "f32", "f26", "f25", "f24", "f23", "f22", "f20", "f10", "f11", "f12", "f13", "f14",
             "f8", "f6", "f4"];
             
app.use(express.static(__dirname + '/public'));

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

    socket.on('rollTheDice', function(){
        let eyes = Math.floor((Math.random() * 6) + 1);

        socket.emit('rolledEyes', eyes);

    });


});

http.listen(3000, function () {
    console.log('listening on *:3000');
});