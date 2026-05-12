var Voice = (function() {
  'use strict';

  var recognition = null;
  var isListening = false;
  var _onResult = null;
  var _onStatus = null;

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
      // Interim result — do nothing yet
      if (!e.results[e.results.length - 1].isFinal) return;

      if (_onResult) _onResult(text.trim());
    };

    recognition.onerror = function(e) {
      isListening = false;
      if (_onStatus) _onStatus('识别出错: ' + e.error);
    };

    recognition.onend = function() {
      isListening = false;
      if (_onStatus) _onStatus('点按录音，说出你的消费');
    };

    return true;
  }

  function start(onResult, onStatus) {
    _onResult = onResult;
    _onStatus = onStatus;
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
      recognition.stop();
      isListening = false;
    }
  }

  function listening() {
    return isListening;
  }

  return {
    isSupported: isSupported,
    start: start,
    stop: stop,
    listening: listening
  };
})();
