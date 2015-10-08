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

    this.opentokCalls.emitEvent();
  }
};

exports['default'] = container;
module.exports = exports['default'];