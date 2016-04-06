'use strict'

var test = require('tape');
var create = require('../server/game').create;

test("When creating game of size 19", (t) => {
    let game = create(19);
    t.equal(game.state().length, 19, "width should be 19")
    t.equal(game.state()[0].length, 19, "height should be 19")
    t.end();
});

test("First player", (t)=>{
    let game = create(19);
    let actual = game.currentPlayer();
    
    t.equal(actual, 1, "should be 1");
    t.end();
});

test("After first move", (t)=>{
    let game = create(19);
    
    game.play({
        x : 0,
        y : 0
    });
    
    let actual = game.currentPlayer();
    t.equal(actual, 2, "player should be 2");
    t.end();
});

test("When player plays valid move", (t)=>{
    let game = create(19);
    
    game.play({
        x:0,
        y:0
    });
    
    t.equal(game.state()[0][0], 1, "state should be updated");
    
    t.end();
})

test("When player plays on already played cell", (t)=>{
    let game = create(19);
    
    // player 1 plays
    game.play({
        x:0,
        y:0
    });
    
    // player 2 plays on same cell
    game.play({
        x:0,
        y:0
    });
    
    t.equal(game.state()[0][0], 1, "state should not change");
    t.end();
})