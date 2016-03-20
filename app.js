var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var createGame = require("./game").create;

server.listen(8080);

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/build/index.html');
});

// serve static files
app.use(express.static('build'));

var connected = [];

// startup websocket channel
io.on('connection', function(socket) {
    // socket.on('my other event', function(data) {
    //     console.log(data);
    // });
    // var users = connected.map(x=>x.client.id);
    // socket.emit("connected", users);
    // socket.broadcast.emit('connected', users);

    socket.on("start", () => {
        if (connected.filter(x => x.client.id === socket.client.id).length > 0) {
            return;
        }
        connected.push(socket);

        if (connected.length === 2) {
            var game = createGame(19);

            connected.forEach(x => {
                // join the game room
                x.join("gameroom");

                // x.emit("started", {
                //     state : game.state
                // });

            });

            io.to("gameroom")
                .emit(
                "started",
                {
                    state: game.state
                });

            io.to("gameroom")
                .emit('message', "game starting");
                
            // setup room
            io.on("")
        }
    });
});