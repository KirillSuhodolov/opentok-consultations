'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var subscriber = {
  /**
   * session.getSubscribersForStream(stream) get subscribers.
   */

  subscribe: function subscribe(stream) {
    if (stream.connection.connectionId !== _container2['default'].opentokSession.connection.connectionId) {
      var targetElement = this.opentokCalls.configs.remoteVideoElement;
      var params = this.opentokCalls.configs.remoteVideoOptions;

      var subscriber = _container2['default'].opentokSession.subscribe(stream, targetElement, params, function (error) {
        subscriber.restrictFrameRate(true);

        _container2['default'].changeContainer('add', 'subscribers', subscriber);

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

      _container2['default'].subscribers.forEach(function (subscriber) {
        if (subscriber.streamId === stream.streamId) {
          foundedSubscriber = subscriber;
        }
      });

      return foundedSubscriber;
    };

    _container2['default'].opentokSession.unsubscribe(subscriber);

    _container2['default'].changeContainer('remove', 'subscribers', subscriber);
  }
};

exports['default'] = subscriber;
module.exports = exports['default'];