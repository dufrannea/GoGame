var io = require("socket.io-client");
var ko = require('knockout');
var board = require('./board').board;

var socket = io.connect('http://barbarossa:8080');
socket.on('message', function(data) {
    messages.push(data);
});

socket.on('connected', function(data) {
    connected(data);
});

var localboard;
var playerIndex;

var getpositions = (state) => {
    var newpos = [];

    for (var i = 0; i < state.length; i++) {
        for (var j = 0; j < state.length; j++) {
            cell = state[i][j];
            if (cell !== 0) {
                newpos.push([i, j, cell]);
            }
        }
    }
    return newpos;
}

socket.on('started', function(data) {
    playerIndex = data.player;
    localboard = board("#go-board-container", playerIndex, data.state.length);

    localboard.create(getpositions(data.state), function(coords) {
        socket.emit("played", coords);
    });

    // player 1 starts.
    if (playerIndex !== 1) {
        localboard.freeze()
    }
});

socket.on("update", function(updates) {
    var state = updates.state;
    var currentPlayer = updates.player;

    var newpos = getpositions(state);

    // i should play
    if (currentPlayer === playerIndex) {
        localboard.unfreeze();
    } else {
        localboard.freeze();
    }

    localboard.update(newpos);
})

var state = ko.observableArray();
var messages = ko.observableArray();
var connected = ko.observableArray();

ko.applyBindings({
    start: function() {
        socket.emit("start");
    },
    messages: messages,
    connected: connected,
    state: state
});