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
    
    generateUniqueId: function() {
        const uuidv4 = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
        };
        return uuidv4().substr(0, 4);
    },

    generateRandomAction: function(){
        const availableActionTypes = ['sync', 'save', 'wait'];
        const duration = this.randomIntFromInterval(1, 5);
        const action = this.randomIntFromInterval(0, 2);
        
        
        return {
            id: this.generateUniqueId(),
            type: availableActionTypes[action],
            duration: duration,
            status: 'idle',
         }
    },

    generateGetAction: function() {
        const events = this.generateActionEvents();
        const newAction = {
            id: this.generateUniqueId(),
            type: 'get',
            duration: 5,
            status: 'idle',
            eventListener: events.eventSuccess,
            eventListenerFail: events.eventFail
        };

        coned.utilities.processQueue.enqueue(newAction);
        this.updateSegment();
    },

    generateActionEvents() {
        const _id = this.generateUniqueId();
        const eventName = `event_${_id}`;
        const eventNameFail = `${eventName}_fail`;

        amplify.subscribe(
			eventName,
			this,
			function(action) {
                if (action !== null && action.hasOwnProperty('result')) {
                    console.log('success');
                    console.log(action.result);
                    amplify.unsubscribe(action.eventListener);
                }
            },
			1
		);
        amplify.subscribe(
			eventNameFail,
			this,
			function(actionFail) {
                if (actionFail !== null && actionFail.hasOwnProperty('error')) {
                    console.log('error');
                    console.log(actionFail.error);
                    amplify.unsubscribe(action.eventListenerFail);
                }
            },
			1
        );

        return {
            eventSuccess: eventName,
            eventFail: eventNameFail
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
        if (action.type === 'get' && action.hasOwnProperty('result')) {
            const data = JSON.stringify(action.result);
            this.log('Action data returned: ' + data);
            this.log('Finished action id: ' + action.id);
        } else {
            this.log('Finished action id: ' + action.id);
        }
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