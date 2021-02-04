var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.processPriorityQueue = coned.utilities.processPriorityQueue || {};
coned.utilities.processPriorityQueue = {

  _priorityQueue: null,
  queueStoreName: 'priorityCommandsQueue',
  actionStoreName: 'priorityActionQueue',
  tryAgainCount: 0,

  /**
   * Creates a new MaxPriorityQueue instance and check pending actions
   */
  init: function () {
    if (this._priorityQueue !== null) return;
    this._priorityQueue = new MaxPriorityQueue({
      priority: (action) => action.priority
    });
    this.checkPendingQueue();
    this.checkPendingAction();
    this.tryAgainCount = 0;
  },

  /**
   * Returns a sorted queue from highest to lowest priority
   * @returns {array}
   */
  getQueue: function () {
    return this._priorityQueue.toArray().map(el => el.element);
  },

  /**
   * Adds an element to the queue
   * @param {object} element
   */
  enqueue: function (element) {
    if (element.hasOwnProperty('priority')) {
      this._priorityQueue = this._priorityQueue.enqueue(element);
      this.saveCurrentQueue();
    }
  },

  /**
   * @returns {boolean}
   */
  isEmpty: function () {
    return this._priorityQueue.isEmpty();
  },

  /**
   * Compare the action typer and return a handler
   * @param {object} action 
   * @returns {any}
   */
  getCommand: function (action) {
    if (!action || !action.type) throw ('Invalid action provided');
    let handler = null;
    if (action.type === 'sync') {
      handler = new SyncObjectCommand(action.duration);
    } else if (action.type === 'save') {
      handler = new CreateDataCommand(action.duration);
    } else if (action.type === 'wait') {
      handler = new WaitCommand(action.duration);
    } else if (action.type === 'get') {
      handler = new GetDataCommand(action.duration, action.count);
    }
    return handler;
  },
  
  /**
   * Execute the action handler
   * @param {object} action
   * @returns {Promise}
   */
  _processAction: function (action) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!action) resolve(null);
        const command = this.getCommand(action);
        const result = await command.execute();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },

  //! devolver resultado o error directos
  /**
   * Execute the first element in the queue and send 
   * the response of the action through amplify events
   * @returns {Promise}
   */
  processAction: function () {
    return new Promise(async (resolve, reject) => {
      let {
        element
      } = this._priorityQueue.front();
      try {
        if (!element) resolve(null);
        this._priorityQueue.dequeue();
        this.saveCurrentQueue();
        element.status = 'inProgress';
        this.saveCurrentAction(element);
        amplify.publish("processingQueueElement", element);
        const result = await this._processAction(element);
        element.status = 'finished';
        this.clearStoredCurrentAction();
        element.result = result;
        amplify.publish("processedQueueElement", element);
        if (element.hasOwnProperty('eventListenerSuccess')) {
          amplify.publish(element.eventListenerSuccess, element);
        }
        resolve();
      } catch (e) {
        const resultTryAgain = await this.tryAgainAction(element);
        if (resultTryAgain.status === 'finished') {
          resolve();
        } else if (resultTryAgain.status === 'error') {
          if (element.hasOwnProperty('eventListenerFail')) {
            amplify.publish(element.eventListenerFail, element);
          }
          reject(resultTryAgain.error);
        }
        reject(e);
      }
    });
  },

  /**
   * Execute all the action in the queue
   * @async
   */
  processAll: async function () {
    await this.processAction();
    if (this._priorityQueue !== null && !this._priorityQueue.isEmpty()) {
      this.processAll();
    }
  },

  /**
   * Save current queue in the kony.store
   */
  saveCurrentQueue: function () {
    const currentQueue = this.getQueue();
    kony.store.setItem(this.queueStoreName, currentQueue);
  },

  /**
   * Save the action that is being executed
   * @param {object} action 
   */
  saveCurrentAction: function (action) {
    kony.store.setItem(this.actionStoreName, action);
  },

  /**
   * Remove action form the store
   */
  clearStoredCurrentAction: function () {
    kony.store.removeItem(this.actionStoreName);
  },

  /**
   * Return the saved queue
   * @returns {array}
   */
  getStoredQueue: function () {
    const storedQueue = kony.store.getItem(this.queueStoreName) || [];
    return storedQueue;
  },

  /**
   * Return the saved action
   * @returns {object}
   */
  getStoredAction: function () {
    const storedAction = kony.store.getItem(this.actionStoreName) || {};
    return storedAction;
  },

  /**
   * Enqueue if exist saved actions 
   */
  checkPendingQueue: function () {
    const data = this.getStoredQueue();
    if (Array.isArray(data) && data.length > 0) {
      for (const action of data) {
        this.enqueue(action);
      }
    }
  },

  /**
   * If the action saved has status inProgress
   * the priority is changed to put it in front of the queue
   */
  checkPendingAction: function () {
    const action = this.getStoredAction();
    if (action !== null && action.hasOwnProperty('status') && action.hasOwnProperty('priority')) {
      if (action.status === 'inProgress') {
        action.priority = 5;
        this.enqueue(action);
      }
    }
  },

  /**
   * Try running the action 3 times if there is an error
   * @param {object} action 
   */
  tryAgainAction: async function (action) {
    try {
      if (this.tryAgainCount < 3) {
        this.tryAgainCount++;
        action.status = 'inProgress';
        action.count = this.tryAgainCount;
        amplify.publish("processingQueueElement", action);
        this.saveCurrentAction(action);
        const result = await this._processAction(action);
        this.tryAgainCount = 0;
        action.status = 'finished';
        this.clearStoredCurrentAction();
        action.result = result;
        amplify.publish("processedQueueElement", action);
        if (action.hasOwnProperty('eventListenerSuccess')) {
          amplify.publish(action.eventListenerSuccess, action);
        }
        return Promise.resolve(action); // validate status finished
      } else {
        this.tryAgainCount = 0;
        action.status = 'error';
        this.clearStoredCurrentAction();
        return Promise.resolve(action); // validate status error
      }
    } catch (error) {
      action.error = error;
      return await this.tryAgainAction(action);
    }

  }
};