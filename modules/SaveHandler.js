var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.processhandler = coned.utilities.processhandler || {};
coned.utilities.processhandler.savehandler = {

    async process(action) {
        return new Promise((resolve, reject) => {
             try{
                 kony.print('SaveHandler: Processing action - ' + action.id, action)
//                  window.setTimeOut(()=>{
//                      kony.print('SaveHandler: Finished Processing - ' + action.id)
//                      resolve(true);
//                  }, action.duration * 1000);
                        kony.timer.schedule("timer4",()=>{
                            kony.print('SaveHandler: Finished Processing - ' + action.id)
                            resolve(true);
                        }, action.duration, false);
             }
             catch(e){
                 kony.print('SaveHandler: Processing failed - ' + action.id)
                 reject(e);
             }
        });
    }


}

// // module.exports = SaveHandler;