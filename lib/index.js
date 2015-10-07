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

var flags = {
  isConnectionCreated: false,
  isSessionConnected: false
};

var container = {
  opentokSession: null,

  localStream: null,

  /**
   * session.getPublisherForStream(stream) get publisher.
   */
  publisher: null,

  streams: [],
  connections: [],
  subscribers: []
};

var controls = {
  mute: function mute() {
    this._toggle('audio', false);
  },

  unmute: function unmute() {
    this._toggle('audio', true);
  },

  turnoff: function turnoff() {
    this._toggle('video', false);
  },

  turnon: function turnon() {
    this._toggle('video', true);
  },

  _toggle: function _toggle(source, state) {
    source = source.capitalize();
    container.publisher['publish' + source](state);
    this['is' + source] = state;
  },

  isAudio: false,
  isVideo: false
};

var publisher = {
  subscribePublisher: function subscribePublisher() {
    if (container.publisher) {
      container.publisher.on({
        streamCreated: this._streamCreatedByPublisher.bind(this),
        streamDestroyed: this._streamDestroyedByPublisher.bind(this),
        destroyed: this._publisherDestroyed.bind(this),
        accessAllowed: function accessAllowed(event) {
          console.debug("The user has granted access to the camera and mic.");
        },
        accessDenied: function accessDenied(event) {
          console.error("The user has denied access to the camera and mic.");
        }
      });
    }
  },

  publish: function publish() {
    var targetElement = this.opentokConsultations.configs.localVideoElement,
        params = this.opentokConsultations.configs.localVideoOptions;

    console.debug("Publish method called.");

    if (container.publisher) {
      console.error("Publisher already created");return;
    }
    if (!container.opentokSession || !flags.isSessionConnected) {
      console.error("Can't create publisher, owning to session is disconnected.");return;
    }

    var publisher = OT.initPublisher(targetElement, params, function (error) {
      if (error) {
        console.error("Error when trying to create publisher.", error);
      } else {
        console.debug("Publisher created.");
      }
    });

    this.opentokConsultations.setToContainer('publisher', publisher);

    this.subscribePublisher();
    this.publishToSession();
  },

  publishToSession: function publishToSession() {
    container.opentokSession.publish(container.publisher, null, function (error) {
      if (error) {
        console.error("Publishing to session error: ", error);
      } else {
        console.debug("Publishing to session.");
      }
    });
  },

  unpublish: function unpublish() {
    if (container.publisher) {
      if (container.opentokSession) {
        container.opentokSession.unpublish(container.publisher);
      }
      container.publisher.destroy();
    }

    console.debug("Publisher destroyed.");
  },

  /**
   * Publisher Handlers
   * @param event
   */

  _streamCreatedByPublisher: function _streamCreatedByPublisher(event) {
    console.debug("Stream created by publisher.");
    this.opentokConsultations.setToContainer('localStream', event.stream);
  },

  _streamDestroyedByPublisher: function _streamDestroyedByPublisher(event) {
    console.debug("Stream destroyed by publisher.");
    this.opentokConsultations.setToContainer('localStream', null);
  },

  _publisherDestroyed: function _publisherDestroyed(event) {
    this.opentokConsultations.setToContainer('publisher', null);
  }
};

var session = {
  subscribeSession: function subscribeSession() {
    if (container.opentokSession) {
      container.opentokSession.on({
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

    return OT.initSession(this.opentokConsultations.apiKey, sessionId);
  },

  /**
   * Session Handlers
   */

  /**
   * Fires in every local and remote new stream
   * @param event
   */
  _streamCreatedInSession: function _streamCreatedInSession(event) {
    if (event.stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      subscriber.subscribe(event.stream);
      this.opentokConsultations.addToContainer('streams', event.stream);
    }
  },

  /**
   * Fires on every local and remote stop streaming
   * @param event
   */
  _streamDestroyedInSession: function _streamDestroyedInSession(event) {
    if (container.opentokSession) {
      if (event.stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
        subscriber.unsubscribe(event.stream);

        this.opentokConsultations.removeFromContainer('streams', event.stream);
      }
    } else {
      this.opentokConsultations.setToContainer('streams', []);
    }
  },

  /**
   * Fires on every local and remote connection.
   * @param event
   */
  _connectionCreated: function _connectionCreated(event) {
    if (event.connection.connectionId === container.opentokSession.connection.connectionId) {
      this.opentokConsultations.isConnectionCreated = true;
    } else {
      this.opentokConsultations.addToContainer('connections', event.connection);
    }
  },

  /**
   * Fires on every local and remote connection.
   * @param event
   */
  _connectionDestroyed: function _connectionDestroyed(event) {
    if (container.opentokSession) {
      if (event.connection.connectionId === container.opentokSession.connection.connectionId) {
        this.opentokConsultations.isConnectionCreated = false;
      } else {
        this.opentokConsultations.removeFromContainer('connections', event.connection);
      }
    } else {
      this.opentokConsultations.setToContainer('connections', []);
    }
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionConnected: function _sessionConnected(event) {
    console.debug("Session connected.");
    this.opentokConsultations.isSessionConnected = true;
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionDisconnected: function _sessionDisconnected(event) {
    console.debug("Session disconnected.");
    this.opentokConsultations.isSessionConnected = false;
  }
};

var subscriber = {
  /**
   * session.getSubscribersForStream(stream) get subscribers.
   */

  subscribe: function subscribe(stream) {
    var _this = this;

    if (stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      var targetElement = this.opentokConsultations.configs.remoteVideoElement;
      var params = this.opentokConsultations.configs.remoteVideoOptions;

      var subscriber = container.opentokSession.subscribe(stream, targetElement, params, function (error) {
        _this.opentokConsultations.addToContainer('subscribers', subscriber);

        if (error) {
          console.error("Error subscribing: ", error);
        } else {
          console.debug("Subscribe to the stream.");
        }
      });
    }
  },

  unsubscribe: function unsubscribe(subscriber, stream) {
    subscriber = subscriber || function () {
      var foundedSubscriber = null;

      container.subscribers.forEach(function (subscriber) {
        if (subscriber.streamId === stream.streamId) {
          foundedSubscriber = subscriber;
        }
      });

      return foundedSubscriber;
    };

    container.opentokSession.unsubscribe(subscriber);

    this.opentokConsultations.removeFromContainer('subscribers', subscriber);
  }
};

/**
 * possible events for subscription are flags and container fields:
 * isConnectionCreated, isSessionConnected,
 * opentokSession, localStream, publisher, streams, connections, subscribers
 * */

var OpentokConsultations = (function (_EventEmitter) {
  _inherits(OpentokConsultations, _EventEmitter);

  function OpentokConsultations(apiKey, configs) {
    var _this2 = this;

    _classCallCheck(this, OpentokConsultations);

    _get(Object.getPrototypeOf(OpentokConsultations.prototype), 'constructor', this).call(this);

    this.apiKey = apiKey;
    this.configs = configs;

    this.container = container;
    this.flags = flags;
    this.controls = controls;
    this.publisher = publisher;
    this.session = session;
    this.subscriber = subscriber;

    Object.keys(this.flags).forEach(function (flagProperty) {
      _this2.flags[flagProperty] = false;

      Object.defineProperty(_this2, flagProperty, {
        get: function get() {
          return this.flags[flagProperty];
        },

        set: function set(flagValue) {
          this.flags[flagProperty] = flagValue;
          this.emitEvent(flagProperty, flagProperty, flagValue);
        }
      });
    });

    this.container.opentokConsultations = this;
    this.flags.opentokConsultations = this;
    this.controls.opentokConsultations = this;
    this.publisher.opentokConsultations = this;
    this.session.opentokConsultations = this;
    this.subscriber.opentokConsultations = this;
  }

  _createClass(OpentokConsultations, [{
    key: 'setToContainer',
    value: function setToContainer(propertyName, value) {
      this.container[propertyName] = value;
      this.emitEvent(propertyName, propertyName, value);
    }
  }, {
    key: 'addToContainer',
    value: function addToContainer(propertyName, value) {
      this.container[propertyName].push(value);
      this.emitEvent(propertyName, propertyName, this.container[propertyName]);
    }
  }, {
    key: 'removeFromContainer',
    value: function removeFromContainer(propertyName, value) {
      this.container[propertyName].splice(container[propertyName].indexOf(value), 1);
      this.emitEvent(propertyName, propertyName, this.container[propertyName]);
    }
  }, {
    key: 'emitEvent',
    value: function emitEvent(event, key, value) {
      this.emit(event, key, value);
      this.emit('emit', key, value);
    }
  }, {
    key: 'connect',
    value: function connect(sessionId, token) {
      if (!sessionId || !token) {
        console.error("SessionId or token empty.");return;
      }
      if (container.opentokSession) {
        console.error("Connection to session already created");
      }

      var opentokSession = session.createSession(sessionId);

      opentokSession.connect(token, function (error) {
        if (error) {
          console.error("Error connecting: ", error);
        } else {
          console.debug("Connect to the session...");
        }
      });

      this.setToContainer('opentokSession', opentokSession);

      session.subscribeSession();
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (container.opentokSession) {
        container.opentokSession.disconnect();

        //TODO: make via class new
        this.setToContainer('opentokSession', null);
        this.setToContainer('localStream', null);
        this.setToContainer('publisher', null);
        this.setToContainer('streams', []);
        this.setToContainer('connections', []);
        this.setToContainer('subscribers', []);

        this.isConnectionCreated = false;
        this.isSessionConnected = false;

        console.debug("Disconnected from the session.");
      } else {
        console.debug("Nothing to Disconnect!");
      }
    }
  }, {
    key: 'isLoading',
    get: function get() {
      return this.isPublishing || this.isSessionConnecting;
    }
  }, {
    key: 'isPublisherStreamed',
    get: function get() {
      return container.localStream;
    }
  }, {
    key: 'isPublisherCreated',
    get: function get() {
      return container.publisher;
    }
  }]);

  return OpentokConsultations;
})(_eventemitter32['default']);

exports['default'] = OpentokConsultations;
module.exports = exports['default'];