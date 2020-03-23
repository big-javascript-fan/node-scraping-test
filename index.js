const { spawn, Thread, Worker } = require('threads');
const { getAccountList } = require('./lib/accountlist');


(async() => {
    let accountList = await getAccountList();
    for(var index=0; index<accountList.length; index++) {
      const run = await spawn(new Worker('./main'));
      run(accountList[index]);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 80000);   //wait 80s for for one bot to completely login and start
    }
})();