let Promise = require('./myPromise')
let fs = require('fs');

let p = new Promise((resolve,reject)=>{
    resolve(new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve(100)
        },1000)
    }))
})
p.then((r)=>{
    console.log(r);
})