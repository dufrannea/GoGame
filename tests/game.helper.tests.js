'use strict'

const test = require('tape'),
    gamehelper = require('../server/game.helper'),
    createEmptyBoard = gamehelper.createEmptyBoard,
    getCellsToTest = gamehelper.getCellsToTest,
    isInFreeZone = gamehelper.isInFreeZone;


test("Cells to test", (t) => {
    var board = createEmptyBoard(19);

    /*
     * 0 0 0
     * 0 1 0
     * 0 0 0
     */
    board[1][1] = 1;

    let cells = getCellsToTest(board, { x: 1, y: 1 }, 1);

    t.looseEqual(
        [],
        cells,
        "should be empty when no opponent surrounding cells");
    t.end();
});

test("Cells to test", (t) => {
    var board = createEmptyBoard(19);

    /*
     * 0 0 0
     * 0 1 2
     * 0 0 0
     */
    board[1][1] = 1;
    board[2][1] = 2;

    let cells = getCellsToTest(board, { x: 1, y: 1 }, 1);

    t.looseEqual(
        [[2, 1]],
        cells,
        "should include all opponents surrounding cells");
    t.end();
})


test("Cells to test", (t) => {
    var board = createEmptyBoard(19);

    /*
     * 1 2 0
     * 0 0 0
     * 0 0 0
     */
    board[0][0] = 1;
    board[0][1] = 2;

    let cells = getCellsToTest(board, { x: 0, y: 0 }, 1);

    t.looseEqual(
        [[0, 1]],
        cells,
        "should include all opponents surrounding cells");
    t.end();
});

test("dfs", (t) => {
    // player 2 just played [3,1]
    let board = [
        [0, 2, 2, 2],
        [2, 1, 1, 1],
        [2, 1, 1, 1],
        [0, 2, 2, 2]
    ];

    let visited = createEmptyBoard(4);
    visited[2][1] = 1;

    let zone = [[2, 1]];
    let actual = isInFreeZone(
        visited,
        board,
        [2, 1],
        1,
        zone);

    t.equal(false, actual, "zone should not be free");

    let sorting = (p1, p2) => {
        let r1 = p1[0] - p2[0];
        if (r1 !== 0) return r1;
        return p1[1] - p2[1];
    }

    t.looseEqual(
        zone.sort(sorting),
        [
            [1, 1],
            [1, 2],
            [1, 3],
            [2, 1],
            [2, 2],
            [2, 3]
        ],
        "all cells to remove should be listed");

    t.end();
});

test("board updating", (t) => {
    // player 2 just played [3,1]
    let board = [
        [0, 2, 2, 2],
        [2, 1, 1, 1],
        [2, 1, 1, 1],
        [0, 2, 2, 2]
    ];

    let expected = [
        [0, 2, 2, 2],
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 2, 2, 2]
    ]
    gamehelper.updateBoard(board, { x: 3, y: 2 }, 2);

    t.looseEqual(
        board,
        expected,
        "all center player 2 pieces should be removed");

    t.end();
});

test("board with inside blocks", (t) => {
    let board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 1, 2, 1, 1, 0],
        [0, 1, 2, 2, 2, 1, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];

    let expected = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];

    gamehelper.updateBoard(board, { x: 2, y: 5 }, 1);

    t.looseEqual(
        board,
        expected,
        "all center player 2 pieces should be removed");

    t.end();
});

// helper function to clone
// an array.
const duplicateState = (state) => {
    let newState = [];
    for (var i in state) {
        let newRow = [];
        for (var j in state[i]) {
            newRow.push(state[i][j]);
        }
        newState.push(newRow);
    }
    return newState;
};

test("complicated board", (t) => {

    // player 2 has just played 9,9
    const state = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 2, 2, 2, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 2, 2, 0, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 2, 2, 2, 2, 1, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 2, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    const expected = duplicateState(state);
    
    gamehelper.updateBoard(state, { x: 9, y: 9 }, 2);
    
    t.looseEqual(state[9][8], 1, "piece should not be removed.")
    // t.looseEqual(state, expected)
    t.end();
})