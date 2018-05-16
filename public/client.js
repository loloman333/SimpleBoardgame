var socket;
var gameInfo = {
    running: false,
    onlineUsers: 0,
    red: "",
    blue: "",
    yellow: "",
    green: "",
    redStones:[ "", "", "", "" ],
    blueStones:[ "", "", "", "" ],
    yellowStones:[ "", "", "", "" ],   
    greenStones:[ "", "", "", "" ]  
};

$(function () {
    socket = io();

    socket.on('gameStatus', function (msg) {
        
        gameInfo = msg;
        $('#onlineUsers').html(gameInfo.onlineUsers);

    });
});
