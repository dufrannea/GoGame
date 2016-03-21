'use strict';

/**
 * Creates an empty square board of given size.
 * @param size {number} - size of the board.
 * @returns an array of arrays of numbers representing
 *  the board, with all cells set to zero.
 */
function createEmptyBoard(size) {
    var state = [];
    for (var i = 0; i < size; i++) {
        var line = [];
        for (var j = 0; j < size; j++) {
            line.push(0);
        }
        state.push(line);
    }
    return state;
}

/**
 * Returns cells that should
 * be seeded for region search when player 
 * has just played in position.
 * If player is 1, we will search for neighbour cells 
 * that belong to player 2.
 * @param state {number[][]} - the state of the board.
 * @param position : { x : number, y : number} - position just played.
 * @param player : number - player who just played.
 * @returns an array of positions.
 */
function getCellsToTest(state, position, player) {
    var cellsToTest = [];

    var x = position.x,
        y = position.y,
        size = state.length;

    if (x > 0) cellsToTest.push([x - 1, y])
    if (x < size - 1) cellsToTest.push([x + 1, y])
    if (y > 0) cellsToTest.push([x, y - 1])
    if (y < size - 1) cellsToTest.push([x, y + 1])

    var opponent = 2 - player + 1;
    return cellsToTest.filter(x => state[x[0]][x[1]] === opponent);
}

/**
 * Updates the board after the move has been applied.
 * Removes captured zones.
 * @param state {number[][]} - the game state.
 * @param position {number[]} - the last played position.
 * @param player {number} - the player who played this position.
 * @returns nothing.
 */
function updateBoard(state, position, player) {
    let visited = createEmptyBoard(state.length);

    let cellsToTest = getCellsToTest(state, position, player);

    if (cellsToTest.length === 0) return;

    cellsToTest.forEach(cell => {
        // mark cell as visited.
        visited[cell[0]][cell[1]] = 1;
        let zone = [cell];
        if (!isInFreeZone(visited, state, cell, 3 - player, zone)) {
            // zone should be removed
            zone.forEach(x => {
                state[x[0]][x[1]] = 0;
            });
        }
    });
}

/**
 * Lists all surrounding cells for a given cell.
 * @param position {Array} - the position for which 
 *  surrounding cells are requested.
 * @return an array of positions.
 */
function surroundingcells(position) {
    let result = [];
    let x = position[0];
    let y = position[1];
    if (x > 0) result.push([x - 1, y])
    if (x < size - 1) result.push([x + 1, y])
    if (y > 0) result.push([x, y - 1])
    if (y < size - 1) result.push([x, y + 1])
    return result;
}

/**
 * Checks if position is in a free zone recursively.
 * If the result is true, zone will remain empty.
 * If the result is false, zone will be filled with
 *  all the positions that belong to the non free zone.
 * @param visited : array listing all visited positions.
 * @param state : state of the board.
 * @param position : position to use as seed.
 * @param player : player to search free group for.
 * @return true if free, false otherwise.
 */
function isInFreeZone(visited, state, position, player, zone) {
    let size = state.length,
        getState = (position) => state[position[0]][position[1]],
        isVisited = (position) => visited[position[0]][position[1]];

    // invariant
    if (getState(position) !== player) throw "position should belong to player";

    let cellsToProcess = [];
    let surrounding = surroundingcells(position);
    for (var i in surrounding) {
        let cell = surrounding[i];
        if (isVisited(cell)) continue;

        if (getState(cell) === 0) {
            return true;
        }

        if (getState(cell) === player) {
            cellsToProcess.push(cell);

            // mark cell as visited
            visited[cell[0]][cell[1]] = 1;
            zone.push(cell);
        }
    }

    for (var i in cellsToProcess) {
        if (isInFreeZone(visited, state, cellsToProcess[i], player, zone)) {
            return true;
        }
    }

    return false;
}

module.exports = {
    createEmptyBoard: createEmptyBoard,
    getCellsToTest: getCellsToTest,
    isInFreeZone: isInFreeZone,
    updateBoard: updateBoard,
    surroundingcells : surroundingcells
};
