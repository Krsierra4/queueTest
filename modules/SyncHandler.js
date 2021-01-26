var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.processhandler = coned.utilities.processhandler || {};
coned.utilities.processhandler.synchandler = {

    async process(action) {
        return new Promise((resolve, reject) => {
             try{
                 kony.print('SyncHandler: Processing action - ' + action.id, action)
//                  window.setTimeOut(()=>{
//                      kony.print('SyncHandler: Finished Processing - ' + action.id)
//                      resolve(true);
//                  }, action.duration * 1000);
    
                        kony.timer.schedule("timer4",()=>{
                            kony.print('SaveHandler: Finished Processing - ' + action.id)
                            resolve(true);
                        }, action.duration, false);
             }
             catch(e){
                 kony.print('SyncHandler: Processing failed - ' + action.id)
                 reject(e);
             }
        });
    }


};

// module.exports = SyncHandler;