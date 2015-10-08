'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

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
    _container2['default'].publisher['publish' + source](state);
    this['is' + source] = state;
  },

  isAudio: false,
  isVideo: false
};

exports['default'] = controls;
module.exports = exports['default'];