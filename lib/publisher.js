'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _isCordova = require('./is-cordova');

var _isCordova2 = _interopRequireDefault(_isCordova);

var publisher = {
  publish: function publish() {
    var targetElement = this.opentokCalls.configs.localVideoElement,
        params = this.opentokCalls.configs.localVideoOptions;

    console.debug("Publish method called.");

    if (_container2['default'].publisher) {
      console.error("Publisher already created");return;
    }
    if (!_container2['default'].opentokSession || !_container2['default'].isSessionConnected) {
      console.error("Can't create publisher, owning to session is disconnected.");return;
    }

    var publisher = undefined;

    if ((0, _isCordova2['default'])()) {
      publisher = OT.initPublisher(this.opentokCalls.configs.apiKey, targetElement, params, function (error) {
        if (error) {
          console.error("Error when trying to create publisher.", error);
        } else {
          console.debug("Publisher created.");
        }
      });
    } else {
      publisher = OT.initPublisher(targetElement, params, function (error) {
        if (error) {
          console.error("Error when trying to create publisher.", error);
        } else {
          console.debug("Publisher created.");
        }
      });
    }

    _container2['default'].changeContainer('set', 'publisher', publisher);

    this.subscribePublisher();
    this.publishToSession();
  },

  unpublish: function unpublish() {
    if (_container2['default'].publisher) {
      if (_container2['default'].opentokSession) {
        _container2['default'].opentokSession.unpublish(_container2['default'].publisher);
      }
      _container2['default'].publisher.destroy();
    }

    console.debug("Publisher destroyed.");
  },

  subscribePublisher: function subscribePublisher() {
    if (_container2['default'].publisher) {
      _container2['default'].publisher.on({
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

  publishToSession: function publishToSession() {
    // Callback not run at cordova ios
    _container2['default'].opentokSession.publish(_container2['default'].publisher, null, function (error) {
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

  _streamCreatedByPublisher: function _streamCreatedByPublisher(event) {
    console.debug("Stream created by publisher.");
    _container2['default'].changeContainer('set', 'localStream', event.stream);
  },

  _streamDestroyedByPublisher: function _streamDestroyedByPublisher(event) {
    console.debug("Stream destroyed by publisher.");
    _container2['default'].changeContainer('set', 'localStream', null);
  },

  _publisherDestroyed: function _publisherDestroyed(event) {
    _container2['default'].changeContainer('set', 'publisher', null);
  }
};

exports['default'] = publisher;
module.exports = exports['default'];