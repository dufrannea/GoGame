"use strict";

var gamehelper = require('./game.helper'),
    createEmptyBoard = gamehelper.createEmptyBoard;

var create = (size) => {

    // player is either 1 or 2
    var currentPlayer = 1;
    var _state = createEmptyBoard(size);

    let isFree = (position, player) => {
        let cells = gamehelper.surroundingcells([position.x, position.y], size);
        return cells.find(x => 
            _state[x[0]][x[1]] === 0 ||
            _state[x[0]][x[1]] === player) ? true : false;
    }
    
    let duplicateState = (state)=>{
        let newState = [];
        for (var i in state){
            let newRow = [];
            for (var j in state[i]){
                newRow.push(state[i][j]);
            }
            newState.push(newRow);
        }
        return newState;
    }
    
    let isValidMove = (position, player) => {
        if (_state[position.x][position.y] !== 0) {
            return false;
        }
        
        if (isFree(position, player)){
            return true;
        }
        
        let newState = duplicateState(_state);
        // pretend the move occured
        newState[position.x][position.y] = currentPlayer;
        
        // here check if move would entail
        // taking a zone. 
        if (gamehelper.getZonesToRemove(newState, position, currentPlayer).length != 0){
            return true;
        }
        
        return false;
    }

    return {
        play: function(position) {
            if (isValidMove(position, currentPlayer)) {
                _state[position.x][position.y] = currentPlayer;

                gamehelper.updateBoard(_state, position, currentPlayer);

                currentPlayer = 3 - currentPlayer;
                return true;
            }
            return false;

        },
        currentPlayer: () => currentPlayer,
        state: _state
    }
}

module.exports.create = create;