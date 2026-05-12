var Voice = (function() {
  'use strict';

  var recognition = null;
  var isListening = false;
  var _onResult = null;
  var _onInterim = null;
  var _onStatus = null;
  var _lastText = '';
  var _fullText = '';
  var _continuous = false;

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
      // Reconstruct full text from all results (handles both continuous and single mode)
      var fullText = '';
      for (var i = 0; i < e.results.length; i++) {
        fullText += e.results[i][0].transcript;
      }
      fullText = fullText.trim();
      if (!fullText) return;

      var isFinal = e.results[e.results.length - 1].isFinal;

      if (_continuous) {
        _fullText = fullText;
        if (_onInterim) _onInterim(fullText, isFinal);
        // Don't call _onResult — wait for manual stop()
      } else {
        _lastText = fullText;
        if (isFinal) {
          if (_onInterim) _onInterim(fullText, true);
          if (_onResult) _onResult(fullText);
        } else {
          if (_onInterim) _onInterim(fullText, false);
        }
      }
    };

    recognition.onerror = function(e) {
      if (_continuous) {
        // In continuous mode, errors are common (no-speech between utterances)
        // Just restart if needed
        if (e.error === 'no-speech' || e.error === 'aborted') {
          if (isListening) {
            setTimeout(function() {
              try { recognition.start(); } catch(ex) {}
            }, 200);
          }
          return;
        }
      }
      isListening = false;
      if (e.error === 'no-speech' || e.error === 'aborted') {
        var captured = _lastText;
        _lastText = '';
        if (captured && _onResult && !_continuous) _onResult(captured);
      }
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        if (_onStatus) _onStatus('识别出错，请重试');
      }
    };

    recognition.onend = function() {
      if (_continuous && isListening) {
        // Natural pause in continuous mode — restart
        setTimeout(function() {
          try { recognition.start(); } catch(ex) { isListening = false; }
        }, 100);
      } else if (!_continuous) {
        isListening = false;
        if (_onStatus && !_lastText) {
          _onStatus('没有识别到内容，请再试一次');
        }
      }
    };

    return true;
  }

  function start(onResult, onInterim, onStatus, continuous) {
    _onResult = onResult;
    _onInterim = onInterim || null;
    _onStatus = onStatus;
    _lastText = '';
    _fullText = '';
    _continuous = !!continuous;

    if (!init()) {
      if (onStatus) onStatus('您的浏览器不支持语音输入');
      return false;
    }

    try {
      recognition.continuous = _continuous;
      recognition.start();
      isListening = true;
      if (onStatus) onStatus(continuous ? '🎙️ 持续录音中…点击按钮结束' : '🎙️ 正在听...');
      return true;
    } catch (e) {
      isListening = false;
      if (onStatus) onStatus('启动失败，请重试');
      return false;
    }
  }

  function stop() {
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
    if (_continuous && _fullText && _onResult) {
      _onResult(_fullText);
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
