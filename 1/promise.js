class Promise {
    constructor(executor){
        this. status = 'pending';
        this.value = undefined;
        this.reason = undefined;
        let self = this;
        self.onResolvedCallbacks = [];
        self.onRejectedCallbacks = [];
        let resolve = (value) =>{
            if(value instanceof Promise){
                return value.then(resolve,reject)
            }
            if(self.status === 'pending'){
                self.value = value;
                self.status = 'fulfilled';
                self.onResolvedCallbacks.forEach(fn=>fn());
            }
        }
        let reject = (reason) =>{
            if(self.status === 'pending'){
                self.reason = reason;
                self.status = 'rejected';
                self.onRejectedCallbacks.forEach(fn=>fn());
            }
        }
        try{
            executor(resolve,reject);
        }catch(e){
            reject(e);
        }
    }
    then(onfulfilled,onrejected){
        onfulfilled = typeof onfulfilled === 'function'?onfulfilled:val=>val;//值的穿透
        onrejected = typeof onrejected === 'function' ?onrejected:err=>{throw err};
        let self = this;
        let promise2 = new Promise((resolve,reject)=>{
            if(self.status === 'fulfilled'){
                setTimeout(()=>{
                    try{
                        let x = onfulfilled(self.value);
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    }
                })
            }
            if(self.status === 'rejected'){
                setTimeout(()=>{
                    try{
                        let x = onrejected(self.reason);
                        resolvePromise(promise2,x,resolve,reject);
                    }catch(e){
                        reject(e);
                    }
                })
            }
            if(self.status === 'pending'){
                self.onResolvedCallbacks.push(()=>{
                    setTimeout(()=>{
                        try{
                            let x = onfulfilled(self.value);
                            resolvePromise(promise2,x,resolve,reject);
                        }catch(e){
                            reject(e);
                        }
                    })
                });
                self.onRejectedCallbacks.push(()=>{
                    setTimeout(()=>{
                        try{
                            let x = onrejected(self.reason);
                            resolvePromise(promise2,x,resolve,reject);
                        }catch(e){
                            reject(e)
                        }
                    })
                })
            }
        });
        return promise2;
    }
    finally(callback){
        return this.then(
            res=>Promise.resolve(callback()).then(()=>val),
            err=>Promise.resolve(callback()).then(() => {throw new Errow()})
        );
    }
}
function resolvePromise(promise2,x,resolve,reject){
    if(promise2 === x){
        return reject(new TypeError('循环引用'));
    }
    if(x !== null &&(typeof x === 'object' || typeof x === 'function')){
        let called;
        try{
            let then = x.then;
            if(typeof then === 'function'){
                then.call(x,y=>{
                    if(called) return;
                    called = true;
                    resolvePromise(promise2,y,resolve,reject);
                },r=>{
                    if(called) return;
                    called = true;
                    reject(r);
                })
            }else{
                resolve(x);
            }
        }catch(e){
            if(called) return;
            called = true;
            reject(e);
        }
    }else{
        resolve(x);
    }
}
// 请实现一个延迟对象
Promise.deferred = function(){
    let dfd = {};
    dfd.promise = new Promise((resolve,reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};

module.exports = Promise;