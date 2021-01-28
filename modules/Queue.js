/**
* @license MIT
* @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
*
*/
var coned = coned || {};
coned.utilities = coned.utilities || {};
coned.utilities.queue = coned.utilities.queue || {};
coned.utilities.queue = {
   automatic:false,
  /**
   * Creates a queue.
   * @param {array} [elements]
   */
//   constructor:function(elements) {
//     this._elements = Array.isArray(elements) ? elements : [];
//     this._offset = 0;
//   },

  /**
   * Adds an element at the back of the queue.
   * @public
   * @param {any} element
   */
  enqueue: function(element) {
    this._elements.push(element);
    this.saveQueue(this._elements);
    return this;
  },

  /**
   * Adds an element at the front of the queue.
   * @public
   * @param {any} element
   */
  enqueueFront: function(element) {
    this._elements.unshift(element);
    this.saveQueue(this._elements);
    return this;
  },

  enqueueArrayFront: function(elements) {
    const newQueue = elements.concat(this._elements);
    this._elements = newQueue;
    this.saveQueue(newQueue);
  },

  /**
   * Dequeues the front element in the queue.
   * @public
   * @returns {any}
   */
  dequeue: function() {
    if (this.size() === 0) return null;

    const first = this.front();
    this._offset += 1;

    if (this._offset * 2 < this._elements.length) return first;

    // only remove dequeued elements when reaching half size
    // to decrease latency of shifting elements.
    this._elements = this._elements.slice(this._offset);
    this.saveQueue(this._elements);
    this._offset = 0;
    return first;
  },

  /**
   * Returns the front element of the queue.
   * @public
   * @returns {any}
   */
  front: function() {
    return this.size() > 0 ? this._elements[this._offset] : null;
  },

  /**
   * Returns the back element of the queue.
   * @public
   * @returns {any}
   */
  back: function() {
    return this.size() > 0 ? this._elements[this._elements.length - 1] : null;
  },

  /**
   * Returns the number of elements in the queue.
   * @public
   * @returns {number}
   */
  size: function() {
    return this._elements.length - this._offset;
  },

  /**
   * Checks if the queue is empty.
   * @public
   * @returns {boolean}
   */
  isEmpty: function() {
    return this.size() === 0;
  },

  /**
   * Returns the remaining elements in the queue as an array.
   * @public
   * @returns {array}
   */
  toArray: function() {
    return this._elements.slice(this._offset);
  },

  /**
   * Clears the queue.
   * @public
   */
  clear: function() {
    this._elements = [];
    this._offset = 0;
  },

  /**
   * Creates a shallow copy of the queue.
   * @public
   * @return {Queue}
   */
//   clone: function() {
//     return new Queue(this._elements.slice(this._offset));
//   },

  /**
   * Creates a queue from an existing array.
   * @public
   * @static
   * @param {array} elements
   * @return {Queue}
   */
  fromArray(elements) {
    this._offset = 0;
    this._elements = Array.isArray(elements) ? elements : [];
    this.saveQueue(this._elements);
  },

  saveQueue(queue) {
    // const stringQ = JSON.stringify(queue);
    const stringQ = queue;
    kony.store.setItem('commandsQueue', stringQ);
  }, 

  getSavedQueue() {
    const stringQ = kony.store.getItem('commandsQueue'); // TODO rerturn an empty array if doesnt exist queue
    // return JSON.parse(stringQ);
    return stringQ;
  }
}

// // module.exports = Queue;