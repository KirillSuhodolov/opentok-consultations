'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventemitter3 = require('eventemitter3');

var _eventemitter32 = _interopRequireDefault(_eventemitter3);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _controls = require('./controls');

var _controls2 = _interopRequireDefault(_controls);

var _publisher = require('./publisher');

var _publisher2 = _interopRequireDefault(_publisher);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

var _subscriber = require('./subscriber');

var _subscriber2 = _interopRequireDefault(_subscriber);

/**
 * possible events for subscription are container fields:
 * */

var OpentokCalls = (function (_EventEmitter) {
  _inherits(OpentokCalls, _EventEmitter);

  function OpentokCalls(configs) {
    _classCallCheck(this, OpentokCalls);

    _get(Object.getPrototypeOf(OpentokCalls.prototype), 'constructor', this).call(this);

    this.configs = configs;
    _container2['default'].opentokCalls = this;
    _controls2['default'].opentokCalls = this;
    _publisher2['default'].opentokCalls = this;
    _session2['default'].opentokCalls = this;
    _subscriber2['default'].opentokCalls = this;
  }

  // public properties to detect status

  _createClass(OpentokCalls, [{
    key: 'emitEvent',

    // privte method
    value: function emitEvent(key, value) {
      if (key && value) {
        this.emit(key, value);

        this.emit('property-changed', key, value);
      }

      this.emit('hash-changed', {
        isConnectionCreated: this.isConnectionCreated,
        isSessionConnected: this.isSessionConnected,
        isCalling: this.isCalling,
        isCallGoes: this.isCallGoes,
        canBePublished: this.canBePublished,
        hasPublisher: this.hasPublisher,
        hasSession: this.hasSession,
        hasLocalStream: this.hasLocalStream,
        isAnyStream: this.isAnyStream,
        isAnyConnection: this.isAnyConnection,
        isAnySubscribers: this.isAnySubscribers
      });
    }

    /*
     * Main methods.
     * */

    // Connect to opentok session
  }, {
    key: 'connect',
    value: function connect(sessionId, token) {
      if (!sessionId || !token) {
        console.error("SessionId or token empty.");return;
      }
      if (_container2['default'].opentokSession) {
        console.error("Connection to session already created");
      }

      this.configs.sessionId = sessionId;
      this.configs.token = token;

      var opentokSession = _session2['default'].createSession(sessionId);

      _container2['default'].changeContainer('set', 'opentokSession', opentokSession);

      _session2['default'].subscribeSession();

      opentokSession.connect(token, function (error) {
        if (error) {
          console.error("Error connecting: ", error);
        } else {
          console.debug("Connect to the session...");
        }
      });
    }

    // Disconnect from opentok session. Do it after destroing publisher.
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (_container2['default'].opentokSession) {
        _container2['default'].opentokSession.disconnect();

        _container2['default'].resetContent();

        console.debug("Disconnected from the session.");
      } else {
        console.debug("Nothing to Disconnect!");
      }
    }

    // Publish to opentok seession. This methods should me called after client connected to session; 
  }, {
    key: 'publish',
    value: function publish() {
      _publisher2['default'].publish();
    }

    // Destroy publisher before disconnect session to do it correctly
  }, {
    key: 'unpublish',
    value: function unpublish() {
      _publisher2['default'].unpublish();
    }
  }, {
    key: 'isSessionConnected',
    get: function get() {
      return _container2['default'].isSessionConnected;
    }
  }, {
    key: 'isConnectionCreated',
    get: function get() {
      return _container2['default'].isConnectionCreated;
    }
  }, {
    key: 'isCalling',
    get: function get() {
      return _container2['default'].opentokSession && _container2['default'].isSessionConnected && _container2['default'].isConnectionCreated && (!_container2['default'].publisher || !_container2['default'].subscribers.length || !_container2['default'].streams.length || !_container2['default'].localStream);
    }
  }, {
    key: 'isCallGoes',
    get: function get() {
      return _container2['default'].opentokSession && _container2['default'].isSessionConnected && _container2['default'].publisher && _container2['default'].subscribers.length && _container2['default'].streams.length && _container2['default'].localStream;
    }
  }, {
    key: 'canBePublished',
    get: function get() {
      return _container2['default'].opentokSession && _container2['default'].isSessionConnected && !_container2['default'].publisher;
    }
  }, {
    key: 'hasPublisher',
    get: function get() {
      return _container2['default'].publisher;
    }
  }, {
    key: 'hasSession',
    get: function get() {
      return _container2['default'].opentokSession;
    }
  }, {
    key: 'hasLocalStream',
    get: function get() {
      return _container2['default'].localStream;
    }
  }, {
    key: 'isAnyStream',
    get: function get() {
      return _container2['default'].streams.length;
    }
  }, {
    key: 'isAnyConnection',
    get: function get() {
      return _container2['default'].connections.length;
    }
  }, {
    key: 'isAnySubscribers',
    get: function get() {
      return _container2['default'].subscribers.length;
    }
  }]);

  return OpentokCalls;
})(_eventemitter32['default']);

exports['default'] = OpentokCalls;
module.exports = exports['default'];