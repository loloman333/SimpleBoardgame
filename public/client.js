let socket;
let gameInfo = {
    running: false,
    onlineUsers: 0,
    turn: null,
    red: null,
    blue: null,
    yellow: null,
    green: null,
    redStones:[],
    blueStones:[],
    yellowStones:[],   
    greenStones:[]  
};

let name;
let color;
let rolledEyes = null;
$(function () {

    socket = io();

    socket.on('gameStatus', function (msg) {

        // update stones
        if ( JSON.stringify(msg.redStones) != JSON.stringify(gameInfo.redStones)){
            removeStones(gameInfo.redStones, "red"); 
            addStones(msg.redStones,"red");
        } if (JSON.stringify(msg.blueStones) != JSON.stringify(gameInfo.blueStones)){
            removeStones(gameInfo.blueStones, "blue"); 
            addStones(msg.blueStones, "blue");
        } if ( JSON.stringify(msg.greenStones) != JSON.stringify(gameInfo.greenStones)){
            removeStones(gameInfo.greenStones, "green"); 
            addStones(msg.greenStones, "green");
        } if (JSON.stringify(msg.yellowStones) != JSON.stringify(gameInfo.yellowStones)){
            removeStones(gameInfo.yellowStones, "yellow"); 
            addStones(msg.yellowStones, "yellow");
        } 

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
        if (color){
            $(".myBtn").prop("disabled", true);
        } else {
            $("#redButton").prop("disabled", gameInfo.red != null);
            $("#blueButton").prop("disabled", gameInfo.blue != null);
            $("#yellowButton").prop("disabled", gameInfo.yellow != null);
            $("#greenButton").prop("disabled", gameInfo.green != null);
        }
        $('#dice').prop("disabled", !color || gameInfo.turn != color || rolledEyes != null);

        // Show Player names
        $("#redText").html(gameInfo.red);
        $("#blueText").html(gameInfo.blue);
        $("#yellowText").html(gameInfo.yellow);
        $("#greenText").html(gameInfo.green);

    });

    // Error Message from Server
    socket.on("myError", function(msg){
        alert(msg);
    });

    socket.on("rolledEyes", function(msg){
        $("#rolledEyes").html(msg);
        $("#rollResult").css("visibility", "visible")

        rolledEyes = msg;
    });
});

// Opens a popup to enter the name
function enterNamePopup(){
    while (name == null || name == '') {
        name = prompt("Please enter your name", "Player 1").replace("\\s+","");;
    }
    confirm("Great! Greetings " + name );         
} 

// sends event to server to pick color
function chooseColor(colorPls){
    if (!name){
        enterNamePopup();
    }

    color = colorPls;
    socket.emit('chooseColor', {name: name, color: colorPls});  
}

// sends request to server to roll a dice
function rollIt(){
    socket.emit("rollTheDice");
    $('#dice').prop("disabled", true);
}

// Remove all Stones in a given array
function removeStones(array, colorP){

    for (let i = 0; i < array.length; i++){
        $("#" + array[i]).removeClass(colorP);
        $("#" + array[i]).off("click");
    }
}

// Adds all Stones in a given array
function addStones(array, colorP){

    for (let i = 0; i < array.length; i++){

       
        let id = "#" + array[i];

        $(id).addClass(colorP);
        $(id).click(function(event){

            let colorF;
            if (event.currentTarget.classList.contains('red')) colorF = 'red';
            if (event.currentTarget.classList.contains('blue')) colorF = 'blue';
            if (event.currentTarget.classList.contains('green')) colorF = 'green';
            if (event.currentTarget.classList.contains('yellow')) colorF = 'yellow';

            let msg = { rolledEyes: rolledEyes,
                        id: event.currentTarget.id,
                        colorP: color,
                        colorF: colorF};

            socket.emit("moveRequest", msg);
        });
    }
}