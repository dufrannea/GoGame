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
 
socket.on('started', function(data){
   var localboard =board("#go-board-container"); 
   localboard.create([[0, 0, 1], [1, 2, 0], [3, 2, 1], [10, 2, 1]]);
});

var state = ko.observableArray();
var messages = ko.observableArray();
var connected = ko.observableArray();

ko.applyBindings({
    start : function(){
        socket.emit("start");
    },
    messages : messages,
    connected : connected,
    state : state
});