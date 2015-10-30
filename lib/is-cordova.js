'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = isCordova;

function isCordova() {
  return document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
}

module.exports = exports['default'];