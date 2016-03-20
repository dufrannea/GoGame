var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var createGame = require("./game").create;
var guid = require('./utils').guid;

server.listen(8080);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/build/index.html');
});

// serve static files
app.use(express.static('build'));

var waitingToPlay = [];
var games = [];

var alreadyInGame = function(socket){
    return games.filter(game => 
        game.players.filter(player => player.client.id === socket.client.id).length > 0).length > 0;
}
// startup websocket channel
io.on('connection', function(socket) {
    
    // a player hits start
    socket.on("start", () => {
        
        if (alreadyInGame(socket)){
            socket.emit("message", "you are already playing dumb ass");
            return;
        }
        
        if (waitingToPlay.filter(x => x.client.id === socket.client.id).length > 0) {
            socket.emit("message", "you are already waiting dumb ass");
            return;
        }
        
        waitingToPlay.push(socket);
        socket.emit("message", "waiting for other player to come join you");

        if (waitingToPlay.length === 2) {
            var game = createGame(19);

            var roomName = guid();
            
            waitingToPlay.forEach(x => {
                // join the game room
                x.join(roomName);
            });

            io.to(roomName)
                .emit(
                "started",
                {
                    state: game.state
                });

            io.to(roomName)
                .emit('message', "game " + roomName);
            
            games.push({
                roomName : roomName,
                players : waitingToPlay
            });
                            
            waitingToPlay = [];
        }
    });
    
    socket.on("played", function(){
        console.info("outside room play")
    })
});