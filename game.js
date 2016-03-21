var gamehelper = require('./game.helper'),
    createEmptyBoard = gamehelper.createEmptyBoard;

var create = (size) => {

    // player is either 1 or 2
    var currentPlayer = 1;
    var _state = createEmptyBoard(size);

    let isFree = (position, player) => {
        let cells = gamehelper.surroundingcells([position.x, position.y]);
        return cells.find(x => 
            _state[x[0]][x[1]] === 0 ||
            _state[x[0]][x[1]] === player) ? true : false;
    }

    let isValidMove = (position, player) => {
        return _state[position.x][position.y] === 0 && 
               isFree(position, player);
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