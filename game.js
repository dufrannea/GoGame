var create = (size) => {

    var state = [];

    // player is either 1 or 2
    var currentPlayer = 1;

    for (var i = 0; i < size; i++) {
        var line = [];
        for (var j = 0; j < size; j++) {
            line.push(0);
        }
        state.push(line);
    }

    return {
        play: function(position) {
            if (state[position.x][position.y] === 0) {
                state[position.x][position.y] = currentPlayer;
                currentPlayer = 2 - currentPlayer + 1;
                return true;
            }
            return false;

        },
        currentPlayer: currentPlayer,
        state : state
    }
}

module.exports.create = create;