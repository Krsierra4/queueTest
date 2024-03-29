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
        // coned.utilities.processPriorityQueue.init();
        coned.utilities.processPriorityQueue.init();
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
            idValue: "id", 
            typeValue:"type", 
            timeValue: "duration",
            priority: "priority"
		};
    },
    
    fillQueue: function (){
		const actionsToGenerate = this.randomIntFromInterval( 1, 5);
        for( let i = 0; i < actionsToGenerate; i++ ){
            const randomAction = this.generateRandomAction();
            kony.print(randomAction);
            coned.utilities.processPriorityQueue.enqueue(randomAction);
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
        const duration = this.randomIntFromInterval(1, 3);
        const action = this.randomIntFromInterval(0, 2);
        const priority = this.randomIntFromInterval(1, 3);
        
        return {
            id: this.generateUniqueId(),
            type: availableActionTypes[action],
            duration: duration,
            status: 'idle',
            priority: priority
         }
    },

    generateGetAction: function() {
        const events = this.generateActionEvents();
        const newAction = {
            id: this.generateUniqueId(),
            type: 'get',
            duration: 5,
            status: 'idle',
            priority: 4,
            eventListenerSuccess: events.eventSuccess,
            eventListenerFail: events.eventFail
        };

        coned.utilities.processPriorityQueue.enqueue(newAction);
        this.updateSegment();
    },

    generateActionEvents() {
        const self = this;
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
                    amplify.unsubscribe(action.eventListenerSuccess);
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
                    amplify.unsubscribe(actionFail.eventListenerFail);
                    self.log(`ERROR action id: ${actionFail.id} Error: ${actionFail.error}`);
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
        const queue = coned.utilities.processPriorityQueue.getQueue();
		const segment = this.view.sgmQueue;
        segment.setData(queue);
        this.view.forceLayout();
    },
    handleProcessingElement:function (action){
        this.log('Processing action id: ' + action.id + ' Type: ' + action.type + ' priority: ' + action.priority + ' duration: ' + action.duration);
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
        if(coned.utilities.processPriorityQueue.isEmpty()){
            this.log('Queue is empty ...');
            return;
        }
        coned.utilities.processPriorityQueue.processAction();
    },
    processAll:function(){
        if(coned.utilities.processPriorityQueue.isEmpty()){
            this.log('Queue is empty ...');
            return;
        }
        coned.utilities.processPriorityQueue.processAll();
    },
	clear:function(){
        const textArea = this.view.txtAreaProcessLog;
        textArea.text = '';
    },

 });