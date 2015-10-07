import EventEmitter from 'eventemitter3';

let flags = {
  isConnectionCreated: false,
  isSessionConnected: false
};

let container = {
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

let controls = {
  mute: function() {
    this._toggle('audio', false);
  },

  unmute: function() {
    this._toggle('audio', true);
  },

  turnoff: function() {
    this._toggle('video', false);
  },

  turnon: function() {
    this._toggle('video', true);
  },

  _toggle: function(source, state) {
    source = source.capitalize();
    container.publisher['publish' + source](state);
    this['is' + source] = state;
  },

  isAudio: false,
  isVideo: false
};

let publisher = {
  subscribePublisher() {
    if (container.publisher) {
      container.publisher.on({
        streamCreated: this._streamCreatedByPublisher.bind(this),
        streamDestroyed: this._streamDestroyedByPublisher.bind(this),
        destroyed: this._publisherDestroyed.bind(this),
        accessAllowed(event) {
          console.debug("The user has granted access to the camera and mic.");
        },
        accessDenied(event) {
          console.error("The user has denied access to the camera and mic.");
        }
      });
    }
  },

  publish() {
    var targetElement = this.opentokConsultations.configs.localVideoElement,
      params = this.opentokConsultations.configs.localVideoOptions;

    console.debug("Publish method called.");

    if (container.publisher) { console.error("Publisher already created"); return; }
    if (!container.opentokSession || !flags.isSessionConnected) {
      console.error("Can't create publisher, owning to session is disconnected."); return;
    }

    let publisher = OT.initPublisher(targetElement, params, function(error) {
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

  publishToSession() {
    container.opentokSession.publish(container.publisher, null, function(error){
      if (error) {
        console.error("Publishing to session error: ", error);
      } else {
        console.debug("Publishing to session.");
      }
    });
  },

  unpublish() {
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

  _streamCreatedByPublisher: function(event) {
    console.debug("Stream created by publisher.");
    this.opentokConsultations.setToContainer('localStream', event.stream);
  },

  _streamDestroyedByPublisher: function (event) {
    console.debug("Stream destroyed by publisher.");
    this.opentokConsultations.setToContainer('localStream', null);
  },

  _publisherDestroyed: function(event) {
    this.opentokConsultations.setToContainer('publisher', null);
  }
};

let session = {
  subscribeSession() {
    if (container.opentokSession) {
      container.opentokSession.on({
        streamCreated: this._streamCreatedInSession.bind(this),
        streamDestroyed:  this._streamDestroyedInSession.bind(this),
        connectionCreated:  this._connectionCreated.bind(this),
        connectionDestroyed: this._connectionDestroyed.bind(this),
        sessionConnected: this._sessionConnected.bind(this),
        sessionDisconnected: this._sessionDisconnected.bind(this)
      });
    }
  },

  createSession(sessionId) {
    OT.on('exception', function(event) {
      console.error('Exception', event);
    });

    if (OT.checkSystemRequirements() !== 1) { alert('Sorry, but your browser not support WebRTC'); }

    return OT.initSession(this.opentokConsultations.apiKey, sessionId);
  },

  /**
   * Session Handlers
   */

  /**
   * Fires in every local and remote new stream
   * @param event
   */
  _streamCreatedInSession(event) {
    if (event.stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      subscriber.subscribe(event.stream);
      this.opentokConsultations.addToContainer('streams', event.stream);

    }
  },

  /**
   * Fires on every local and remote stop streaming
   * @param event
   */
  _streamDestroyedInSession(event) {
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
  _connectionCreated(event) {
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
  _connectionDestroyed(event) {
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
  _sessionConnected: function(event) {
    console.debug("Session connected.");
    this.opentokConsultations.isSessionConnected = true;
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionDisconnected: function(event) {
    console.debug("Session disconnected.");
    this.opentokConsultations.isSessionConnected = false;
  }
};

let subscriber = {
  /**
   * session.getSubscribersForStream(stream) get subscribers.
   */

  subscribe(stream) {
    if (stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      var targetElement = this.opentokConsultations.configs.remoteVideoElement;
      var params = this.opentokConsultations.configs.remoteVideoOptions;

      var subscriber = container.opentokSession.subscribe(stream, targetElement, params, error => {
        this.opentokConsultations.addToContainer('subscribers', subscriber);

        if (error) {
          console.error("Error subscribing: ", error);
        } else {
          console.debug("Subscribe to the stream.");
        }
      });
    }
  },

  unsubscribe(subscriber, stream) {
    subscriber = subscriber || function() {
      var foundedSubscriber = null;

      container.subscribers.forEach(function(subscriber) {
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
class OpentokConsultations extends EventEmitter {
  constructor(apiKey, configs) {
    super();

    this.apiKey = apiKey;
    this.configs = configs;

    this.container = container;
    this.flags = flags;
    this.controls = controls;
    this.publisher = publisher;
    this.session = session;
    this.subscriber = subscriber;

    Object.keys(this.flags).forEach(flagProperty => {
      this.flags[flagProperty] = false;

      Object.defineProperty(this, flagProperty, {
        get: function() {
          return this.flags[flagProperty];
        },

        set: function(flagValue) {
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

  get isLoading() {
    return this.isPublishing || this.isSessionConnecting;
  }

  get isPublisherStreamed() {
    return container.localStream;
  }

  get isPublisherCreated() {
    return container.publisher;
  }

  setToContainer(propertyName, value) {
    this.container[propertyName] = value;
    this.emitEvent(propertyName, propertyName, value);
  }

  addToContainer(propertyName, value) {
    this.container[propertyName].push(value);
    this.emitEvent(propertyName, propertyName, this.container[propertyName]);
  }

  removeFromContainer(propertyName, value) {
    this.container[propertyName].splice(container[propertyName].indexOf(value), 1);
    this.emitEvent(propertyName, propertyName, this.container[propertyName]);
  }

  emitEvent(event, key, value) {
    this.emit(event, key, value);
    this.emit('emit', key, value);
  }

  connect(sessionId, token) {
    if (!sessionId || !token) { console.error("SessionId or token empty."); return; }
    if (container.opentokSession) { console.error("Connection to session already created"); }

    let opentokSession = session.createSession(sessionId);

    opentokSession.connect(token, function(error) {
      if (error) {
        console.error("Error connecting: ", error);
      } else {
        console.debug("Connect to the session...");
      }
    });

    this.setToContainer('opentokSession', opentokSession);

    session.subscribeSession();
  }

  disconnect() {
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
}

module.exports = OpentokConsultations;
