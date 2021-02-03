var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.processPriorityQueue = coned.utilities.processPriorityQueue || {};
coned.utilities.processPriorityQueue = {

    _priorityQueue: null,
    queueStoreName: 'priorityCommandsQueue',
    actionStoreName: 'priorityActionQueue',

    init: function () {
        if (this._priorityQueue !== null) return;
        this._priorityQueue = new MaxPriorityQueue({ priority: (action) => action.priority });
        this.checkPendingQueue();
        this.checkPendingAction();
    },

    getQueue: function () {
        return this._priorityQueue.toArray().map(el => el.element);
    },

    enqueue: function (element) {
        if (element.hasOwnProperty('priority')) {
            this._priorityQueue = this._priorityQueue.enqueue(element);
            this.saveCurrentQueue();
        }
        //TODO handle the missing parameter
    },

    isEmpty: function() {
        return this._priorityQueue.isEmpty();
    },

    getCommand: function (action) {
        if (!action || !action.type) {
            throw ('Invalid action provided');
        }
        let handler = null;
        if (action.type === 'sync') {
            handler = new SyncObjectCommand(action.duration);
        } else if (action.type === 'save') {
            handler = new CreateDataCommand(action.duration);
        } else if (action.type === 'wait') {
            handler = new WaitCommand(action.duration);
        } else if (action.type === 'get') {
            handler = new GetDataCommand(action.duration);
        }
        return handler;
    },

    _processAction: function (action) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!action) {
                    resolve(null);
                }
                const command = this.getCommand(action);
                const result = await command.execute();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    },

    processAction: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let { element } = this._priorityQueue.front();
                if (!element) {
                    resolve(null);
                    //TODO improve error handling
                }
                this._priorityQueue.dequeue();
                this.saveCurrentQueue();
                element.status = 'inProgress';
                this.saveCurrentAction(element);
                amplify.publish("processingQueueElement", element);
                const result = await this._processAction(element);
                element.status = 'finished';
                this.saveCurrentAction(element);
                element.result = result;
                amplify.publish("processedQueueElement", element);
                if (element.hasOwnProperty('eventListener')) {
                    amplify.publish(element.eventListener, element);
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },
    processAll: async function () {
        await this.processAction();
        if (this._priorityQueue !== null && !this._priorityQueue.isEmpty()) {
            this.processAll();
        }
    },

    saveCurrentQueue: function() {
        const currentQueue = this.getQueue();
        kony.store.setItem(this.queueStoreName, currentQueue);
    },

    saveCurrentAction: function(action) {
        kony.store.setItem(this.actionStoreName, action);
    },

    getStoredQueue: function() {
        const storedQueue = kony.store.getItem(this.queueStoreName) || [];
        return storedQueue;
    },

    getStoredAction: function() {
        const storedAction = kony.store.getItem(this.actionStoreName) || {};
        return storedAction;
    },

    checkPendingQueue: function() {
        const data = this.getStoredQueue();
        if (Array.isArray(data) && data.length > 0) {
            for (const action of data) {
                this.enqueue(action);
            }
        }
    },

    checkPendingAction: function() {
        const action = this.getStoredAction();
        if (action !== null && action.hasOwnProperty('status') && action.hasOwnProperty('priority')) {
            if (action.status === 'inProgress') {
                action.priority = 5;
                this.enqueue(action);
            }
        }
    }
};
