"use strict";

var gamehelper = require('./game.helper'),
    createEmptyBoard = gamehelper.createEmptyBoard;

var create = (size) => {

    // player is either 1 or 2
    var currentPlayer = 1;
    var _state = createEmptyBoard(size);
    var _forbiddenMove = undefined;

    let isFree = (position, player) => {
        let cells = gamehelper.surroundingcells([position.x, position.y], size);
        return cells.find(x =>
            _state[x[0]][x[1]] === 0 ||
            _state[x[0]][x[1]] === player) ? true : false;
    }

    let duplicateState = (state) => {
        let newState = [];
        for (var i in state) {
            let newRow = [];
            for (var j in state[i]) {
                newRow.push(state[i][j]);
            }
            newState.push(newRow);
        }
        return newState;
    }

    let moveValidity = (position, player) => {
        // zone is occupied
        if (_state[position.x][position.y] !== 0) {
            return false;
        }
        
        // zone is free
        if (isFree(position, player)) {
            return true;
        }

        if (_forbiddenMove && (_forbiddenMove[0] == position.x && _forbiddenMove[1] == position.y)) {
            return false;
        }

        let newState = duplicateState(_state);
        // pretend the move occured
        newState[position.x][position.y] = currentPlayer;

        let zonesToRemove = gamehelper
            .getZonesToRemove(
            newState,
            position,
            currentPlayer);

        // here check if move would entail
        // taking a zone. 
        if (zonesToRemove.length != 0) {
            return {
                isValid: true,
                isKo: zonesToRemove.find(zone => zone.length === 1) === undefined ? false : true,
                koCell : zonesToRemove[0][0]
            };
        }

        return false;
    }

    return {
        play: function(position) {
            let move = moveValidity(position, currentPlayer);
            if (move || move.isValid) {
                _state[position.x][position.y] = currentPlayer;

                if (move.isKo) {
                    _forbiddenMove = move.koCell;
                } else {
                    // cancel ko.
                    _forbiddenMove = undefined;
                }

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