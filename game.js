var gamehelper = require('./game.helper'),
    createEmptyBoard = gamehelper.createEmptyBoard;

var create = (size) => {

    // player is either 1 or 2
    var currentPlayer = 1;
    var _state = createEmptyBoard(size);

    return {
        play: function(position) {
            if (_state[position.x][position.y] === 0) {
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