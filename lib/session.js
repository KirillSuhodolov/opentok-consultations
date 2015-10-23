'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _subscriber = require('./subscriber');

var _subscriber2 = _interopRequireDefault(_subscriber);

var session = {
  subscribeSession: function subscribeSession() {
    if (_container2['default'].opentokSession) {
      _container2['default'].opentokSession.on({
        streamCreated: this._streamCreatedInSession.bind(this),
        streamDestroyed: this._streamDestroyedInSession.bind(this),
        connectionCreated: this._connectionCreated.bind(this),
        connectionDestroyed: this._connectionDestroyed.bind(this),
        sessionConnected: this._sessionConnected.bind(this),
        sessionDisconnected: this._sessionDisconnected.bind(this)
      });
    }
  },

  createSession: function createSession(sessionId) {
    OT.on('exception', function (event) {
      console.error('Exception', event);
    });

    if (OT.checkSystemRequirements() !== 1) {
      alert('Sorry, but your browser not support WebRTC');
    }

    return OT.initSession(this.opentokCalls.configs.key, sessionId);
  },

  /**
   * Session Handlers
   */

  /**
   * Fires in every local and remote new stream
   * @param event
   */
  _streamCreatedInSession: function _streamCreatedInSession(event) {
    console.debug("Stream created in session callback called.");
    if (event.stream.connection.connectionId !== _container2['default'].opentokSession.connection.connectionId) {
      _subscriber2['default'].subscribe(event.stream);
      _container2['default'].changeContainer('add', 'streams', event.stream);
    }
  },

  /**
   * Fires on every local and remote stop streaming
   * @param event
   */
  _streamDestroyedInSession: function _streamDestroyedInSession(event) {
    console.debug("Stream destroyed in session callback called.");
    if (_container2['default'].opentokSession) {
      if (event.stream.connection.connectionId !== _container2['default'].opentokSession.connection.connectionId) {
        _subscriber2['default'].unsubscribe(event.stream);

        _container2['default'].changeContainer('remove', 'streams', event.stream);
      }
    } else {
      _container2['default'].changeContainer('set', 'streams', []);
    }
  },

  /**
   * Fires on every local and remote connection.
   * Don't fired on codova ios
   * @param event
   */
  _connectionCreated: function _connectionCreated(event) {
    console.debug("Connection created callback called.");
    if (event.connection.connectionId === _container2['default'].opentokSession.connection.connectionId) {
      _container2['default'].changeContainer('set', 'isConnectionCreated', true);
    } else {
      _container2['default'].changeContainer('add', 'connections', event.connection);
    }
  },

  /**
   * Fires on every local and remote connection.
   * Don't fired on codova ios
   * @param event
   */
  _connectionDestroyed: function _connectionDestroyed(event) {
    console.debug("Connection destroyed callback called.");
    if (_container2['default'].opentokSession) {
      if (event.connection.connectionId === _container2['default'].opentokSession.connection.connectionId) {
        _container2['default'].changeContainer('set', 'isConnectionCreated', false);
      } else {
        _container2['default'].changeContainer('remove', 'connections', event.connection);
      }
    } else {
      _container2['default'].changeContainer('set', 'connections', []);
    }
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionConnected: function _sessionConnected(event) {
    console.debug("Session connected.");
    _container2['default'].changeContainer('set', 'isSessionConnected', true);
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionDisconnected: function _sessionDisconnected(event) {
    console.debug("Session disconnected.");
    _container2['default'].changeContainer('set', 'isSessionConnected', false);
  }
};

exports['default'] = session;
module.exports = exports['default'];