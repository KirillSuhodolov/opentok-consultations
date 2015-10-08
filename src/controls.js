import container from './container';

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

export default controls;