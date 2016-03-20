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
                players : waitingToPlay,
                game : game
            });
                            
            waitingToPlay = [];
        }
    });
    
    socket.on("played", function(args){
          var foundGames =  games.filter(game => 
                game.players.filter(player => player.client.id === socket.client.id).length > 0);
          if (foundGames.length === 0){
            console.info("player is not is game");
            return;
          }
          game = foundGames[0];
          gameEngine = foundGames[0].game;
          
          // TODO : put player index in there
          gameEngine.play({ x : args[0], y : args[1]});
          
          // here check everything in the game
          socket.to(game.roomName)
                .emit("message", "other player played" + args)
                
          // send state to everyone
          io.to(game.roomName)
            .emit("update", gameEngine.state); 
    })
});