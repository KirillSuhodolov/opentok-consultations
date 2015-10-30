import container from './container';

let subscriber = {
  /**
   * session.getSubscribersForStream(stream) get subscribers.
   */

  subscribe(stream) {
    if (stream.connection.connectionId !== container.opentokSession.connection.connectionId) {
      var targetElement = this.opentokCalls.configs.remoteVideoElement;
      var params = this.opentokCalls.configs.remoteVideoOptions;

      var subscriber = container.opentokSession.subscribe(stream, targetElement, params, error => {
        // Not working on cordova ios
        // subscriber.restrictFrameRate(true);
        
        container.changeContainer('add', 'subscribers', subscriber);

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

    container.changeContainer('remove', 'subscribers', subscriber);
  }
};

export default subscriber;
