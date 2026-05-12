var Voice = (function() {
  'use strict';

  var recognition = null;
  var isListening = false;
  var _onResult = null;
  var _onInterim = null;
  var _onStatus = null;
  var _lastText = '';

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function init() {
    if (!isSupported()) return false;
    if (recognition) return true;
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = function(e) {
      var text = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      text = text.trim();
      if (!text) return;

      var isFinal = e.results[e.results.length - 1].isFinal;
      _lastText = text;
      if (isFinal) {
        if (_onInterim) _onInterim(text, true);
        if (_onResult) _onResult(text);
      } else {
        if (_onInterim) _onInterim(text, false);
      }
    };

    recognition.onerror = function(e) {
      isListening = false;
      // 'no-speech' or 'aborted' are common — use last interim if any
      if (e.error === 'no-speech' || e.error === 'aborted') {
        var captured = _lastText;
        _lastText = '';
        if (captured && _onResult) _onResult(captured);
      }
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        if (_onStatus) _onStatus('识别出错，请重试');
      }
    };

    recognition.onend = function() {
      isListening = false;
      if (_onStatus && !_lastText) {
        _onStatus('没有识别到内容，请再试一次');
      }
    };

    return true;
  }

  function start(onResult, onInterim, onStatus) {
    _onResult = onResult;
    _onInterim = onInterim || null;
    _onStatus = onStatus;
    _lastText = '';

    if (!init()) {
      if (onStatus) onStatus('您的浏览器不支持语音输入');
      return false;
    }
    try {
      recognition.start();
      isListening = true;
      if (onStatus) onStatus('🎙️ 正在听...');
      return true;
    } catch (e) {
      isListening = false;
      if (onStatus) onStatus('启动失败，请重试');
      return false;
    }
  }

  function stop() {
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
      isListening = false;
    }
  }

  function listening() { return isListening; }

  return {
    isSupported: isSupported,
    start: start,
    stop: stop,
    listening: listening
  };
})();
