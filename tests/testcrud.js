"use strict"

const test = require("tape");
const crud = require("./crud");
 
test("Test simple crud", (t)=>{
    crud({
       projectId : "" 
    })("Game").create({
        state : [1,2,3]
    }).then((v)=>{
       console.info(v)
    }).catch((e)=>{
        t.fail();
    });
    
    t.end();
})

/**
test("Test simple read",(t)=>{
    crud({
        projectId : ""
    })("Game")
    .read(5634472569470976 )
    .then((v)=>{
       console.info(v)
    }).catch((e)=>{
        t.fail();
    });
    
    t.end();
})
 */