const express = require('express')

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var gameInfo = {
    running: false,
    onlineUsers: 0,
    turn: 'green',
    red: null,
    blue: null,
    yellow: null,
    green: null,
    redStones:["f26", "f24", "f23", "f22"],
    blueStones:["hb1","hb2", "hb3", "hb4" ],
    yellowStones:["hy1", "hy2", "hy3", "hy4"],   
    greenStones:["f32", "f34", "f36", "hg4"]  
};

var redStart = "f10";
var blueStart = "f3";
var greenStart = "f31";
var yellowStart = "f38";

var redEnd = "f20";
var blueEnd = "f2";
var greenEnd = "f21";
var yellowEnd = "f39";

var redOrder = ["f10", "f11", "f12", "f13", "f14", "f8" , "f6" , "f4" , "f1" , "f2" , 
                "f3" , "f5" , "f7" , "f9" , "f15", "f16", "f17", "f18", "f19", "f21", 
                "f31", "f30", "f29", "f28", "f27", "f33", "f35", "f37", "f40", "f39",
                "f38", "f36", "f34", "f32", "f26", "f25", "f24", "f23", "f22", "f20",
                "gr1", "gr2", "gr3", "gr4"
            ];
var blueOrder = [ "f3" , "f5" , "f7" , "f9" , "f15", "f16", "f17", "f18", "f19", "f21", 
                  "f31", "f30", "f29", "f28", "f27", "f33", "f35", "f37", "f40", "f39",
                  "f38", "f36", "f34", "f32", "f26", "f25", "f24", "f23", "f22", "f20", 
                  "f10", "f11", "f12", "f13", "f14", "f8" , "f6" , "f4", "f1" , "f2",
                  "gb1", "gb2", "gb3", "gb4"
            ];
var greenOrder = [ "f31", "f30", "f29", "f28", "f27", "f33", "f35", "f37", "f40", "f39", 
                   "f38", "f36", "f34", "f32", "f26", "f25", "f24", "f23", "f22", "f20", 
                   "f10", "f11", "f12", "f13", "f14", "f8" , "f6" , "f4", "f1" , "f2" , 
                   "f3" , "f5" , "f7" , "f9" , "f15", "f16", "f17", "f18","f19", "f21", 
                   "gg1", "gg2", "gg3", "gg4"
            ];
var yellowOrder = [ "f38", "f36", "f34", "f32", "f26", "f25", "f24", "f23", "f22", "f20", 
                    "f10", "f11", "f12", "f13", "f14", "f8" , "f6" , "f4", "f1" , "f2",
                    "f3" , "f5" , "f7" , "f9" , "f15", "f16", "f17", "f18","f19", "f21", 
                    "f31", "f30", "f29", "f28", "f27", "f33", "f35", "f37","f40", "f39", 
                    "gy1", "gy2", "gy3", "gy4"
                ];

             
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

    // Wenn der User würfeln möchte
    socket.on('rollTheDice', function(){
        let eyes = Math.floor((Math.random() * 6) + 1);

        socket.emit('rolledEyes', eyes);

    });

    // Wenn Spieler bewegen will bro
    socket.on('moveRequest', function(msg){

        if (msg.colorP != gameInfo.turn) {
            socket.emit('myError', 'Fehler: Nicht am Zug!');
            return;} 
        if (msg.colorP != msg.colorF) {
            socket.emit('myError', 'Fehler: Falsche Farbe!');
            return;}
        if (!msg.rolledEyes) {
            socket.emit('myError', 'Fehler: Noch nicht gewürfelt!'); 
            return;}     
            
        let oldPos = msg.id;
        let newPos;
        let order;

        //richtige order auswählen
        if (msg.colorP == "red") order = redOrder;
        if (msg.colorP == "blue") order = blueOrder;
        if (msg.colorP == "green") order = greenOrder;
        if (msg.colorP == "yellow") order = yellowOrder;

        // Geklickter Spieler steht in Homebase
        if (msg.id.includes('h') ){
            if (msg.rolledEyes != 6){
                socket.emit('myError', 'Nur mit Sex kannst du aus dem Haus gehen!');
            } else {
                // Aus dem Haus gehen
            }
        //Geklickter Spieler steht nicht im Haus
        } else {             
            if (order.indexOf(oldPos) + msg.rolledEyes > order.length - 1){

                newPos = order[order.length - 2 - (msg.rolledEyes - (order.length - order.indexOf(oldPos)))];

            } else {
                newPos = order[order.indexOf(oldPos) + msg.rolledEyes];
            }
            
        }

        //Check if there's a player on new pos
        if (gameInfo.redStones.includes(newPos)){
            if (msg.colorF == "red"){
                socket.emit("myError", "Hier steht scho ana du oasch!");
                return;
            } else {
                gameInfo.redStones[gameInfo.redStones.indexOf(newPos)] = sendHome('red');
            }
        } else if ( gameInfo.blueStones.includes(newPos)){
            if (msg.colorF == "blue"){
                socket.emit("myError", "Hier steht scho ana du oasch!");
                return;
            } else {
                gameInfo.blueStones[gameInfo.blueStones.indexOf(newPos)] = sendHome('blue');
            }
        } else if ( gameInfo.greenStones.includes(newPos)){
            if (msg.colorF == "green"){
                socket.emit("myError", "Hier steht scho ana du oasch!");
                return;
            } else {
                gameInfo.greenStones[gameInfo.greenStones.indexOf(newPos)] = sendHome('green');
            }
        } else if ( gameInfo.yellowStones.includes(newPos)){
            if (msg.colorF == "yellow"){
                socket.emit("myError", "Hier steht scho ana du oasch!");
                return;
            } else {
                gameInfo.yellowStones[gameInfo.yellowStones.indexOf(newPos)] = sendHome('yellow');
            }
        }   
        
        if (msg.colorP == "red") gameInfo.redStones[gameInfo.redStones.indexOf(oldPos)] = newPos;
        if (msg.colorP == "blue") gameInfo.blueStones[gameInfo.blueStones.indexOf(oldPos)] = newPos;
        if (msg.colorP == "green") gameInfo.greenStones[gameInfo.greenStones.indexOf(oldPos)] = newPos;
        if (msg.colorP == "yellow") gameInfo.yellowStones[gameInfo.yellowStones.indexOf(oldPos)] = newPos;

        io.emit('gameStatus', gameInfo);

    });


});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

function sendHome(color){
    if (color == 'red'){
        if (! gameInfo.redStones.includes('hr1')) return 'hr1';
        if (! gameInfo.redStones.includes('hr2')) return 'hr2';
        if (! gameInfo.redStones.includes('hr3')) return 'hr3';
        if (! gameInfo.redStones.includes('hr4')) return 'hr4';
    }
    if (color == 'blue'){
        if (! gameInfo.redStones.includes('hb1')) return 'hb1';
        if (! gameInfo.redStones.includes('hb2')) return 'hb2';
        if (! gameInfo.redStones.includes('hb3')) return 'hb3';
        if (! gameInfo.redStones.includes('hb4')) return 'hb4';
    }
    if (color == 'green'){
        if (! gameInfo.redStones.includes('hg1')) return 'hg1';
        if (! gameInfo.redStones.includes('hg2')) return 'hg2';
        if (! gameInfo.redStones.includes('hg3')) return 'hg3';
        if (! gameInfo.redStones.includes('hg4')) return 'hg4';
    }
    if (color == 'yellow'){
        if (! gameInfo.redStones.includes('hy1')) return 'hy1';
        if (! gameInfo.redStones.includes('hy2')) return 'hy2';
        if (! gameInfo.redStones.includes('hy3')) return 'hy3';
        if (! gameInfo.redStones.includes('hy4')) return 'hy4';
    }
}