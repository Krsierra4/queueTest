define({ 
    //Application LifeCycle
    onNavigate:async function(){
        this.clearListeners();
    },
    postShow:function (){
        this.setupActions();
        this.setupListeners();
        this.setupSegment();
    },
    
    onDestroy:function(){
        this.clearListeners();
    },


    //App logic
    setupActions:function(){
//         this.view.btnFillQueue.onClick = this.fillQueue;
//         this.view.btnProcessOne.onClick = this.processOne;
        coned.utilities.processQueue.init();
    },
    
    setupListeners:function(){
		amplify.subscribe(
			'processingQueueElement',
			this,
			this.handleProcessingElement,
			1
		);
        amplify.subscribe(
			'processedQueueElement',
			this,
			this.handleProcessedElement,
			1
		);
	},
    clearListeners:function(){
		amplify.unsubscribeAll('processedQueueElement');
        amplify.unsubscribeAll('processingQueueElement');
	},
    setupSegment:function(){
        const segment = this.view.sgmQueue;
        segment.widgetDataMap = {
            lblId:"id", 
            lblType:"type", 
            lblStatus:"status"
		};
    },
    
    fillQueue: function (){
		const actionsToGenerate = this.randomIntFromInterval( 1, 5);
        for( let i = 0; i < actionsToGenerate; i++ ){
            const randomAction = this.generateRandomAction();
            kony.print(randomAction);
            coned.utilities.processQueue.enqueue(randomAction);
        }
        this.updateSegment();
    },

    randomIntFromInterval: (min, max) => {
        return Math.floor( Math.random() * ( max - min + 1 ) + min );
    },
    
    generateRandomAction: function(){
        const availableActionTypes = ['sync', 'save', 'wait']; //TODO check line looks important 
        const duration = this.randomIntFromInterval(1, 5);
        const action = this.randomIntFromInterval(0, 2);
        const uuidv4 = function () {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        
        return {
            id: uuidv4().substr(0, 4),
            type: availableActionTypes[action],
            duration: duration,
            status: 'idle',
           // eventListener: 'someNameFunction_fail' //TODO implement this functionality
         }
    },
    
    updateSegment:function(){
        const queue = coned.utilities.processQueue.getQueue();
		const segment = this.view.sgmQueue;
        segment.setData(queue);
        this.view.forceLayout();
    },
    handleProcessingElement:function (action){
        this.log('Processing action id: ' + action.id + ' Type: ' + action.type + ' duration: ' + action.duration);
        this.updateSegment();
    },
    handleProcessedElement:function (action){
        this.log('Finished action id: ' + action.id);
        this.updateSegment();
    },
    log:function(logtext){
        const textArea = this.view.txtAreaProcessLog;
        let text = textArea.text;
        text = text + '\r\n' + logtext;
        textArea.text = text;
    },
    processOne:function(){
        if(coned.utilities.queue.isEmpty()){
            this.log('Queue is empty ...');
            return;
        }
        coned.utilities.processQueue.processAction();
    },
    processAll:function(){
        if(coned.utilities.queue.isEmpty()){
            this.log('Queue is empty ...');
            return;
        }
        coned.utilities.processQueue.processAll();
    },
	clear:function(){
        const textArea = this.view.txtAreaProcessLog;
        textArea.text = '';
    },

 });