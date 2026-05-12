var App = (function() {
  'use strict';

  // ---- DOM refs ----
  var $ = function(id) { return document.getElementById(id); };

  var tabAdd    = $('tab-add');
  var tabList   = $('tab-list');
  var tabStats  = $('tab-stats');
  var voiceBtn       = $('voice-btn');
  var voiceHint      = $('voice-hint');
  var voiceTranscript = $('voice-transcript');
  var inputAmount   = $('input-amount');
  var inputDesc     = $('input-desc');
  var inputDate     = $('input-date');
  var inputCategory = $('input-category');
  var btnSave       = $('btn-save');
  var expenseList   = $('expense-list');
  var toastEl       = $('toast');
  var navLabel      = $('nav-label');
  var statTotal     = $('stat-total');
  var statCount     = $('stat-count');
  var statAvg       = $('stat-avg');

  var currentTab = 'add';
  var statsPeriod = 'month';
  var statsYear, statsMonth;

  // ---- Init ----
  function init() {
    inputDate.value = new Date().toISOString().slice(0, 10);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
      });
    });

    // Period switch (month/year)
    document.querySelectorAll('.period-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        statsPeriod = this.dataset.period;
        document.querySelectorAll('.period-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        refreshStats();
      });
    });

    // Stats nav
    var now = new Date();
    statsYear = now.getFullYear();
    statsMonth = now.getMonth() + 1;
    $('nav-prev').addEventListener('click', function() { shiftStats(-1); });
    $('nav-next').addEventListener('click', function() { shiftStats(1); });

    // Voice button
    voiceBtn.addEventListener('click', function() {
      if (Voice.listening()) {
        Voice.stop();
        voiceBtn.classList.remove('listening');
        voiceTranscript.style.display = 'none';
        voiceHint.textContent = '点按录音，说出你的消费';
        return;
      }
      voiceBtn.classList.add('listening');
      voiceTranscript.style.display = 'block';
      voiceTranscript.textContent = '...';
      voiceTranscript.className = 'voice-transcript is-interim';

      Voice.start(
        function(result) {
          // Final result
          voiceBtn.classList.remove('listening');
          voiceTranscript.className = 'voice-transcript';
          voiceTranscript.textContent = '';
          voiceTranscript.style.display = 'none';
          voiceHint.textContent = '点按录音，说出你的消费';
          parseVoiceResult(result);
        },
        function(text, isFinal) {
          // Interim callback — live transcript
          voiceTranscript.textContent = text || '...';
          if (isFinal) {
            voiceTranscript.className = 'voice-transcript';
          } else {
            voiceTranscript.className = 'voice-transcript is-interim';
          }
          voiceHint.textContent = isFinal ? '✅ 识别完成' : '🎙️ 正在听...';
        },
        function(status) {
          voiceHint.textContent = status;
          if (status.indexOf('识别出错') >= 0 || status.indexOf('不支持') >= 0 || status.indexOf('没有识别到') >= 0) {
            voiceBtn.classList.remove('listening');
            voiceTranscript.style.display = 'none';
            voiceTranscript.textContent = '';
          }
        }
      );
    });

    // Save button
    btnSave.addEventListener('click', saveRecord);

    // Easy amount input
    inputDesc.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') saveRecord();
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function() {});
    }

    switchTab('add');
  }

  // ---- Tab switching ----
  function switchTab(tab) {
    currentTab = tab;
    tabAdd.classList.toggle('active', tab === 'add');
    tabList.classList.toggle('active', tab === 'list');
    tabStats.classList.toggle('active', tab === 'stats');

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'list') refreshList();
    if (tab === 'stats') refreshStats();
  }

  // ---- Voice result parser ----
  function parseVoiceResult(text) {
    if (!text) return;
    inputDesc.value = text;

    // Try to extract amount from speech
    var amountMatch = text.match(/(\d+\.?\d*)\s*(块|元|块钱|元钱|¥|￥)/);
    if (!amountMatch) {
      amountMatch = text.match(/(\d+\.?\d*)/);
    }
    if (amountMatch && !inputAmount.value) {
      inputAmount.value = parseFloat(amountMatch[1]);
    }

    // Auto classify
    if (!inputCategory.value) {
      var result = Classifier.classify(text);
      toast('已自动分类为: ' + Classifier.getIcon(result.category) + ' ' + result.category);
    }

    inputAmount.focus();

    // Auto-save if amount and description are both present
    if (inputAmount.value && inputDesc.value) {
      setTimeout(function() {
        var r = Classifier.classify(text);
        if (r.confidence >= 0.4) {
          saveRecord();
        }
      }, 500);
    }
  }

  // ---- Save record ----
  function saveRecord() {
    var amount = parseFloat(inputAmount.value);
    var desc = inputDesc.value.trim();

    if (!amount || amount <= 0) {
      toast('请输入金额');
      inputAmount.focus();
      return;
    }
    if (!desc) {
      toast('请输入消费内容');
      inputDesc.focus();
      return;
    }

    var category = inputCategory.value;
    if (!category) {
      var result = Classifier.classify(desc);
      category = result.category;
    }

    var record = {
      amount: amount,
      description: desc,
      category: category,
      date: inputDate.value || new Date().toISOString().slice(0, 10)
    };

    Storage.save(record);

    // Reset form
    inputAmount.value = '';
    inputDesc.value = '';
    inputCategory.value = '';
    inputDate.value = new Date().toISOString().slice(0, 10);

    toast('✅ 已记录 ' + Classifier.getIcon(category) + ' ¥' + amount.toFixed(2));
    if (currentTab === 'list') refreshList();
    if (currentTab === 'stats') refreshStats();
  }

  // ---- List view ----
  function refreshList() {
    var records = Storage.getAll();

    if (records.length === 0) {
      expenseList.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">还没有记账，去记一笔吧</div></div>';
      return;
    }

    // Group by date
    var groups = {};
    records.forEach(function(r) {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });

    var dates = Object.keys(groups).sort(function(a, b) { return b.localeCompare(a); });

    var html = '';
    dates.forEach(function(date) {
      html += '<div class="expense-group"><div class="expense-date">' + date + '</div>';
      groups[date].forEach(function(r) {
        var icon = Classifier.getIcon(r.category);
        var catClass = getCatClass(r.category);
        html += '<div class="expense-item">' +
          '<div class="cat-icon ' + catClass + '">' + icon + '</div>' +
          '<div class="item-info"><div class="item-desc">' + esc(r.description) + '</div>' +
          '<div class="item-meta">' + r.category + '</div></div>' +
          '<div class="item-amount">¥' + r.amount.toFixed(2) + '</div>' +
          '<button class="btn-delete" data-id="' + r.id + '">🗑</button>' +
          '</div>';
      });
      html += '</div>';
    });

    expenseList.innerHTML = html;

    // Delete handlers
    expenseList.querySelectorAll('.btn-delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('确定删除这条记录吗？')) {
          Storage.remove(this.dataset.id);
          refreshList();
        }
      });
    });
  }

  // ---- Statistics ----
  function refreshStats() {
    var records;
    if (statsPeriod === 'month') {
      records = Storage.getByMonth(statsYear, statsMonth);
      navLabel.textContent = statsYear + '年' + statsMonth + '月';
    } else {
      records = Storage.getByYear(statsYear);
      navLabel.textContent = statsYear + '年';
    }

    var total = records.reduce(function(s, r) { return s + r.amount; }, 0);
    statTotal.textContent = '¥' + total.toFixed(2);
    statCount.textContent = records.length;

    if (statsPeriod === 'month') {
      var daysInMonth = new Date(statsYear, statsMonth, 0).getDate();
      statAvg.textContent = '¥' + (records.length ? (total / daysInMonth).toFixed(2) : '0');
    } else {
      statAvg.textContent = '¥' + (records.length ? (total / 12).toFixed(2) : '0');
    }

    // Hide nav arrows in year mode
    $('stats-nav').style.display = statsPeriod === 'month' ? 'flex' : 'flex';

    Charts.renderPie('pie-chart', records);
    Charts.renderBar('bar-chart', records, statsPeriod, statsYear, statsMonth);
  }

  function shiftStats(dir) {
    if (statsPeriod === 'month') {
      statsMonth += dir;
      if (statsMonth > 12) { statsMonth = 1; statsYear++; }
      if (statsMonth < 1) { statsMonth = 12; statsYear--; }
    } else {
      statsYear += dir;
    }
    refreshStats();
  }

  // ---- Helpers ----
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function() { toastEl.classList.remove('show'); }, 2000);
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getCatClass(cat) {
    var map = {
      '餐饮': 'food', '交通': 'transport', '购物': 'shopping',
      '娱乐': 'entertainment', '住房': 'housing', '医疗': 'medical',
      '教育': 'education', '其他': 'other'
    };
    return map[cat] || 'other';
  }

  return { init: init, switchTab: switchTab, refreshList: refreshList, refreshStats: refreshStats };
})();

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
