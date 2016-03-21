'use strict'

var test = require('tape'),
    gamehelper = require('./game.helper'),
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
        cells,
        [],
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
        cells,
        [[2, 1]],
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
        cells,
        [[0, 1]],
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
    
    let zone = [[2,1]];
    let actual = isInFreeZone(
        visited, 
        board, 
        [2,1], 
        1, 
        zone);
       
    t.equal(false, actual, "zone should not be free");
    
    let sorting= (p1, p2) => {
        let r1 = p1[0] - p2[0];
        if (r1 !== 0) return r1;
        return p1[1] - p2[1]; 
    }
    
    t.looseEqual([
            [1,1],
            [1,2],
            [1,3],
            [2,1],
            [2,2],
            [2,3]
        ], 
        zone.sort(sorting));
    t.end();
})

