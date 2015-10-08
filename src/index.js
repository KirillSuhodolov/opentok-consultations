import EventEmitter from 'eventemitter3';
import container from './container';
import controls from './controls';
import publisher from './publisher';
import session from './session';
import subscriber from './subscriber';

/**
 * possible events for subscription are container fields:
 * */
class OpentokCalls extends EventEmitter {
  constructor(configs) {
    super();

    this.configs = configs;

    // this.controls = controls;
    // this.publisher = publisher;
    // this.session = session;
    // this.subscriber = subscriber;

    // this.controls.opentokCalls = this;
    // this.publisher.opentokCalls = this;
    // this.session.opentokCalls = this;
    // this.subscriber.opentokCalls = this;

    container.opentokCalls = this;
    controls.opentokCalls = this;
    publisher.opentokCalls = this;
    session.opentokCalls = this;
    subscriber.opentokCalls = this;    
  }

  // public properties to detect status
  get isSessionConnected() {
    return container.isSessionConnected;  
  }

  get isConnectionCreated() {
    return container.isConnectionCreated;  
  }

  get isCalling() {
    return (container.opentokSession && container.isSessionConnected && container.isConnectionCreated) &&
    (!container.publisher || !container.subscribers.length || !container.streams.length || !container.localStream);
  }

  get isCallGoes() {
     return container.opentokSession && container.isSessionConnected && container.isConnectionCreated &&
      container.publisher && container.subscribers.length && container.streams.length && container.localStream;
  }

  get canBePublished() {
    return container.opentokSession && container.isSessionConnected && container.isConnectionCreated && !container.publisher;
  }

  get hasPublisher() {
    return container.publisher;
  }

  get hasSession() {
    return container.opentokSession;
  }

  get hasLocalStream() {
    return container.localStream;
  }

  get isAnyStream() {
    return container.streams.length;
  }

  get isAnyConnection() {
    return container.connections.length;
  }

  get isAnySubscribers() {
    return container.subscribers.length;
  }

  // privte method
  emitEvent(key, value) {
    this.emit(key, value);

    this.emit('property-changed', key, value);

    this.emit('hash-changed', {
      isCalling: this.isCalling,
      isCallGoes: this.isCallGoes,
      canBePublished: this.canBePublished,
      hasPublisher: this.hasPublisher,
      hasSession: this.hasSession,
      hasLocalStream: this.hasLocalStream,
      isAnyStream: this.isAnyStream,
      isAnyConnection: this.isAnyConnection,
      isAnySubscribers: this.isAnySubscribers,
    });
  }

  /*
   * Main methods.
   * */

  // Connect to opentok session
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

    container.changeContainer('set', 'opentokSession', opentokSession);

    session.subscribeSession();
  }

  // Disconnect from opentok session. Do it after destroing publisher.
  disconnect() {
    if (container.opentokSession) {
      container.opentokSession.disconnect();

      container.resetContent();

      console.debug("Disconnected from the session.");
    } else {
      console.debug("Nothing to Disconnect!");
    }
  }

  
  // Publish to opentok seession. This methods should me called after client connected to session;  
  publish() {
    publisher.publish();
  }

  // Destroy publisher before disconnect session to do it correctly
  unpublish() {
    publisher.unpublish()
  }
}

export default OpentokCalls;
