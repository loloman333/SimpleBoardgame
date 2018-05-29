let socket;
let gameInfo = {
    running: false,
    onlineUsers: 0,
    red: null,
    blue: null,
    yellow: null,
    green: null,
    redStones:[ ],
    blueStones:[ ],
    yellowStones:[  ],   
    greenStones:[  ]  
};

let name;
let color;

$(function () {
    socket = io();

    socket.on('gameStatus', function (msg) {

        console.log(gameInfo);

        gameInfo = msg;

        // Show online Users
        $('#onlineUsers').html(gameInfo.onlineUsers);
        playingPlayers = 0;
        if (gameInfo.red != null) playingPlayers += 1;
        if (gameInfo.blue != null) playingPlayers += 1;
        if (gameInfo.green != null) playingPlayers += 1;
        if (gameInfo.yellow != null) playingPlayers += 1;
        $('#playingUsers').html(playingPlayers);
        $('#spectatingUsers').html(gameInfo.onlineUsers - playingPlayers);

        // Disable unavailable Buttons
        console.log(color);
        if (color){
            $(".myBtn").prop("disabled", true);
        } else {
            $("#redButton").prop("disabled", gameInfo.red != null);
            $("#blueButton").prop("disabled", gameInfo.blue != null);
            $("#yellowButton").prop("disabled", gameInfo.yellow != null);
            $("#greenButton").prop("disabled", gameInfo.green != null);
        }

        // Show Player names
        $("#redText").html(gameInfo.red);
        $("#blueText").html(gameInfo.blue);
        $("#yellowText").html(gameInfo.yellow);
        $("#greenText").html(gameInfo.green);

        /*
        if (!name){ // If there's no name yet enter one
            enterNamePopup();
        } else if (!color) {  // Check for color
            if (gameInfo.red == name){
                color = 'red'; 
                confirm("You're playing as red now!");
            } else if (gameInfo.blue == name){ 
                color = 'blue';
                confirm("You're playing as blue now!"); 
            } else if (gameInfo.green == name){ 
                color = 'green';
                confirm("You're playing as green now!");  
            } else if (gameInfo.yellow == name){ 
                color = 'yellow';
                confirm("You're playing as yellow now!"); 
            }
        }*/
    });

    // Error Message from Server
    socket.on("myError", function(msg){
        alert(msg);
    });
});

// Opens a popup to enter the name
function enterNamePopup(){
    while (name == null || name == ''){
        name = prompt("Please enter your name", "Player 1").replace("\\s+","");;
    }
    
    confirm("Great! Greetings " + name );         
} 

// sends event to server to evaluate color pick
function chooseColor(colorPls){
    if (!name){
        enterNamePopup();
    }

    color = colorPls;
    socket.emit('chooseColor', {name: name, color: colorPls});  
}

// rolls a Dice (1 - 6)
function rollIt(){
    let eyes = Math.floor((Math.random() * 6) + 1);
    $("#rolledEyes").html(eyes);

}