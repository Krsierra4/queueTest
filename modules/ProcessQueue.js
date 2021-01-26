var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.processQueue = coned.utilities.processQueue || {};
coned.utilities.processQueue = {

    init: function () {
        actionQueue = coned.utilities.queue.fromArray([]);
    },

    getQueue: function () {
        return coned.utilities.queue.toArray();
    },

    enqueue: function (element) {
        coned.utilities.queue.enqueue(element);
    },

    getCommand: function (action) {

        if (!action || !action.type) {
            throw ('Invalid action provided');
        }
        let handler = null;
        if (action.type === 'sync') {
            handler = new SyncObjectCommand();
        } else if (action.type === 'save') {
            handler = new CreateDataCommand();
        } else if (action.type === 'wait') {
            handler = new WaitCommand(action.duration);
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
                action.status = 'processing'
                const result = await command.execute(); //TODO change data to send to command
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    },

    processAction: function () {
        return new Promise(async (resolve, reject) => {
            try {
                const action = coned.utilities.queue.front();
                if (!action) {
                    resolve(null);
                }
                amplify.publish("processingQueueElement", action);
                const result = await this._processAction(action);
                if (result) {
                    coned.utilities.queue.dequeue();
                    amplify.publish("processedQueueElement", action);
                    resolve(true);
                } else {
                    amplify.publish("processingQueueElementFailed", action);
                    reject(false);
                }
            } catch (e) {
                reject(e);
            }
        });
    },
    processAll: async function () {
        await this.processAction();
        if (!coned.utilities.queue.isEmpty()) {
            this.processAll();
        }
    },
    processAuto: function (value) {
        coned.utilities.processQueue.automatic = value;
    }

};