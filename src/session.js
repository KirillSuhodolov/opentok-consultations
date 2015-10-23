import container from './container';
import subscriber from './subscriber';

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

    return OT.initSession(this.opentokCalls.configs.key, sessionId);
  },

  /**
   * Session Handlers
   */

  /**
   * Fires in every local and remote new stream
   * @param event
   */
  _streamCreatedInSession(event) {
    console.debug("Stream created in session callback called.");
    if (event.stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      subscriber.subscribe(event.stream);
      container.changeContainer('add', 'streams', event.stream);

    }
  },

  /**
   * Fires on every local and remote stop streaming
   * @param event
   */
  _streamDestroyedInSession(event) {
    console.debug("Stream destroyed in session callback called.");
    if (container.opentokSession) {
      if (event.stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
        subscriber.unsubscribe(event.stream);

        container.changeContainer('remove', 'streams', event.stream);
      }
    } else {
      container.changeContainer('set', 'streams', []);
    }
  },

  /**
   * Fires on every local and remote connection.
   * Don't fired on codova ios
   * @param event
   */
  _connectionCreated(event) {
    console.debug("Connection created callback called.");
    if (event.connection.connectionId === container.opentokSession.connection.connectionId) {
      container.changeContainer('set', 'isConnectionCreated', true);
    } else {
      container.changeContainer('add', 'connections', event.connection);
    }
  },

  /**
   * Fires on every local and remote connection.
   * Don't fired on codova ios
   * @param event
   */
  _connectionDestroyed(event) {
    console.debug("Connection destroyed callback called.");
    if (container.opentokSession) {
      if (event.connection.connectionId === container.opentokSession.connection.connectionId) {
        container.changeContainer('set', 'isConnectionCreated', false);
      } else {
        container.changeContainer('remove', 'connections', event.connection);
      }
    } else {
      container.changeContainer('set', 'connections', []);
    }
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionConnected: function(event) {
    console.debug("Session connected.");
    container.changeContainer('set', 'isSessionConnected', true);
  },

  /**
   * Fires once at local application
   * @param event
   */
  _sessionDisconnected: function(event) {
    console.debug("Session disconnected.");
    container.changeContainer('set', 'isSessionConnected', false);
  }
};

export default session;
