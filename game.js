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

    /**
     * Find dead cells and remove them.
     */
    function clearBoard(state, position, player) {

        var regionsToTest = [];

        var x = position.x,
            y = position.y;

        if (x > 0) regionsToTest.push([x - 1, y])
        if (x < size - 1) regionsToTest.push([x + 1, y])
        if (y > 0) regionsToTest.push([x, y - 1])
        if (y < size - 1) regionsToTest.push([x, y + 1])

        var opponent = 2 - player + 1;
        regionsToTest = regionsToTest.filter(x => x[3] === opponent);

        if (regionsToTest.length === 0) return;

        for (var regIndex in regionsToTest) {
            var startPos = regionsToTest[regIndex];

            // the "middle" line
            // go left
            var i = startPos[0]-1;
            var isFree = false;
            while (i >= 0 && !isFree) {
                var cellValue = state[i][startPos[1]];
                if (cellValue === player) {
                    break;
                }
                if (cellValue === 0){
                    isFree = true;
                }
                i--;
            }
            if (isFree) return;
            var leftMost = i+1;
            
            // go right
            var i = startPos[0]+1;
            while (i <= size - 1 && !isFree) {
                var cellValue = state[i][startPos[1]];
                if (cellValue === player) {
                    break;
                }
                if (cellValue === 0){
                    isFree = true;
                }
                i++;
            }
            if (isFree) return;
            var rightMost = i-1;
            
            var j = startPos[1] - 1 ;
            // now test all lines above
            while (j >=0)  {
                for (var i = leftMost; i <= rightMost; i++){
                    var cellValue = state[i][j];
                    
                    if (cellValue === player){}                    
                }
            }
        }
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
        currentPlayer: () => currentPlayer,
        state: state
    }
}

module.exports.create = create;