var io = require("socket.io-client");
var ko = require('knockout');
var board = require('./board').board;

var socket = io.connect('http://localhost:8080');
socket.on('message', function(data) {
    messages.push(data);
});

socket.on('connected', function(data) {
    connected(data);
});

var localboard;

socket.on('started', function(data) {
    localboard = board("#go-board-container");
    
    localboard.create([], function(coords) {
        console.info("player played" + coords);
        
        socket.emit("played", coords);
    });
});

socket.on("update", function(state){
    var newpos = [];
    
    for (var i = 0; i< state.length; i++){
        for (var j = 0; j < state.length; j++){
            cell = state[i][j];
            if (cell!==0){
                newpos.push([i,j,cell]);
            }        
        }
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