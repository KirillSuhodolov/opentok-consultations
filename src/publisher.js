import container from './container';
import isCordova from './is-cordova';

let publisher = {
  publish() {
    var targetElement = this.opentokCalls.configs.localVideoElement,
      params = this.opentokCalls.configs.localVideoOptions;

    console.debug("Publish method called.");

    if (container.publisher) { console.error("Publisher already created"); return; }
    if (!container.opentokSession || !container.isSessionConnected) {
      console.error("Can't create publisher, owning to session is disconnected."); return;
    }
    
    let publisher;

    if (isCordova()) {
      publisher = OT.initPublisher(this.opentokCalls.configs.apiKey, targetElement, params, function(error) {
        if (error) {
          console.error("Error when trying to create publisher.", error);
        } else {
          console.debug("Publisher created.");
        }
      });
    } else {
      publisher = OT.initPublisher(targetElement, params, function(error) {
        if (error) {
          console.error("Error when trying to create publisher.", error);
        } else {
          console.debug("Publisher created.");
        }
      });
    }

    container.changeContainer('set', 'publisher', publisher);

    this.subscribePublisher();
    this.publishToSession();
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

  publishToSession() {
    // Callback not run at cordova ios
    container.opentokSession.publish(container.publisher, null, function(error){
      if (error) {
        console.error("Publishing to session error: ", error);
      } else {
        console.debug("Publishing to session.");
      }
    });
  },

  /**
   * Publisher Handlers
   * @param event
   */

  _streamCreatedByPublisher: function(event) {
    console.debug("Stream created by publisher.");
    container.changeContainer('set', 'localStream', event.stream);
  },

  _streamDestroyedByPublisher: function (event) {
    console.debug("Stream destroyed by publisher.");
    container.changeContainer('set', 'localStream', null);
  },

  _publisherDestroyed: function(event) {
    container.changeContainer('set', 'publisher', null);
  }
};

export default publisher;
