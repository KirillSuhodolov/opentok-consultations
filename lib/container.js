'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var container = {
  opentokCalls: null,

  isConnectionCreated: false,
  isSessionConnected: false,

  opentokSession: null,

  localStream: null,

  /**
   * session.getPublisherForStream(stream) get publisher.
   */
  // local publisher
  publisher: null,

  // other streams in session (other participants streams)
  streams: [],

  // other connections in session (other participants connections)
  connections: [],

  // your subscribers on participants streams
  subscribers: [],

  // Methods to change container content and emit events
  setToContainer: function setToContainer(propertyName, value) {
    this[propertyName] = value;
    this.emitEvent(propertyName, propertyName, this[propertyName]);
  },

  addToContainer: function addToContainer(propertyName, value) {
    this[propertyName].push(value);
    this.emitEvent(propertyName, propertyName, this[propertyName]);
  },

  removeFromContainer: function removeFromContainer(propertyName, value) {
    this[propertyName].splice(this[propertyName].indexOf(value), 1);
    this.emitEvent(propertyName, propertyName, this[propertyName]);
  },

  changeContainer: function changeContainer(action, propertyName, value) {
    switch (action) {
      case 'set':
        this[propertyName] = value;
        break;
      case 'add':
        this[propertyName].push(value);
        break;
      case 'remove':
        this[propertyName].splice(this[propertyName].indexOf(value), 1);
        break;
    }

    this.opentokCalls.emitEvent(propertyName, this[propertyName]);
  },

  resetContent: function resetContent() {
    this.isConnectionCreated = false;
    this.isSessionConnected = false;
    this.opentokSession = null;
    this.localStream = null;
    this.publisher = null;
    this.streams = [];
    this.connections = [];
    this.subscribers = [];

    this.opentokCalls.emitEvent(propertyName, this[propertyName]);
  }
};

exports['default'] = container;
module.exports = exports['default'];