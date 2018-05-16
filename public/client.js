let socket;
let gameInfo = {
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

let name;
let color;

$(function () {
    socket = io();

    socket.on('gameStatus', function (msg) {

        gameInfo = msg;
        $('#onlineUsers').html(gameInfo.onlineUsers);

        if (!name){
            enterNamePopup();
        } else if (!color) {
            console.log(gameInfo);

            if (gameInfo.red == name){ color = 'red' }
            else if (gameInfo.blue == name){ color = 'blue' }
            else if (gameInfo.green == name){ color = 'green' }
            else if (gameInfo.yellow == name){ color = 'yellow' }

            confirm("You're playing as " + color + " now!");
        }

        socket.emit();

    });
});

function enterNamePopup(){
    while (name == null || name == ''){
        name = prompt("Please enter your name", "Player 1").replace("\\s+","");;
    }
    
    alert("Great! Greetings " + name + "\nNext choose the color you want to play!\nYou can also just spectate the game.")         
}

function chooseColor(color){
    if (!name){
        enterNamePopup();
    }

    socket.emit('chooseColor', {name: name, color: color})

}