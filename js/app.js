var App = (function() {
  'use strict';

  var $ = function(id) { return document.getElementById(id); };

  // ---- Auth DOM ----
  var authPage       = $('auth-page');
  var authModeText   = $('auth-mode-text');
  var authUsername   = $('auth-username');
  var authPassword   = $('auth-password');
  var authPassword2  = $('auth-password2');
  var authRegisterExtra = $('auth-register-extra');
  var authRemember   = $('auth-remember');
  var authAutoLogin  = $('auth-auto-login');
  var authError      = $('auth-error');
  var authBtnSubmit  = $('auth-btn-submit');
  var authBtnSwitch  = $('auth-btn-switch');

  // ---- Main DOM ----
  var mainContainer  = $('main-container');
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
  var statAvgLabel  = document.querySelector('#stats-summary .stat-item:last-child .stat-label');

  // Edit modal DOM
  var editModal     = $('edit-modal');
  var editAmount    = $('edit-amount');
  var editDesc      = $('edit-desc');
  var editDate      = $('edit-date');
  var editCategory  = $('edit-category');
  var btnEditSave   = $('btn-edit-save');
  var btnEditCancel = $('btn-edit-cancel');
  var modalOverlay  = $('modal-overlay');
  var dayDetailContainer = $('day-detail-container');
  var navDateInput  = $('nav-date-input');
  var navMonthInput = $('nav-month-input');
  var batchMode     = $('batch-mode');
  var batchResults  = $('batch-results');
  var batchSwitchLabel = $('batch-switch-label');
  var _editingId = null;
  var _batchItems = [];

  var currentTab = 'add';
  var statsPeriod = 'month';
  var statsYear, statsMonth, statsDay;
  var isRegisterMode = false;
  var currentUser = null;

  // ==================== AUTH ====================
  function showAuth() {
    authPage.classList.add('active');
    mainContainer.classList.remove('active');
    mainContainer.style.display = 'none';
  }

  function showMain(user) {
    currentUser = user;
    Storage.setUser(user.id);

    // Update all header usernames
    var names = document.querySelectorAll('[id^="header-username"]');
    names.forEach(function(el) { el.textContent = user.username; });

    authPage.classList.remove('active');
    mainContainer.classList.add('active');
    mainContainer.style.display = 'flex';

    // Init date
    inputDate.value = new Date().toISOString().slice(0, 10);

    // Init stats nav
    var now = new Date();
    statsYear = now.getFullYear();
    statsMonth = now.getMonth() + 1;
    statsDay = now.getDate();

    switchTab('add');
    toast('👋 欢迎, ' + user.username);
  }

  function handleAuth() {
    var username = authUsername.value.trim();
    var password = authPassword.value;
    var remember = authRemember.checked;
    var autoLogin = authAutoLogin.checked;

    authError.textContent = '';

    if (isRegisterMode) {
      var password2 = authPassword2.value;
      if (password !== password2) {
        authError.textContent = '两次密码不一致';
        return;
      }
      var regResult = Auth.register(username, password);
      if (!regResult.ok) {
        authError.textContent = regResult.error;
        return;
      }
      // After register, auto-login
      var loginResult = Auth.login(username, password, remember, autoLogin);
      if (loginResult.ok) {
        showMain(loginResult.user);
      }
    } else {
      var loginResult = Auth.login(username, password, remember, autoLogin);
      if (!loginResult.ok) {
        authError.textContent = loginResult.error;
        return;
      }
      showMain(loginResult.user);
    }
  }

  function switchAuthMode() {
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
      authModeText.textContent = '注册新账户';
      authBtnSubmit.textContent = '注 册';
      authBtnSwitch.textContent = '已有账户？去登录';
      authRegisterExtra.style.display = 'block';
      authAutoLogin.parentElement.style.display = 'none';
      authRemember.parentElement.style.display = 'none';
    } else {
      authModeText.textContent = '登录你的账户';
      authBtnSubmit.textContent = '登 录';
      authBtnSwitch.textContent = '还没有账户？去注册';
      authRegisterExtra.style.display = 'none';
      authAutoLogin.parentElement.style.display = '';
      authRemember.parentElement.style.display = '';
    }
    authError.textContent = '';
    authUsername.value = '';
    authPassword.value = '';
    authPassword2.value = '';
  }

  function handleLogout() {
    if (!confirm('确定要退出登录吗？')) return;
    Auth.logout();
    currentUser = null;
    Voice.stop();
    voiceBtn.classList.remove('listening');
    voiceTranscript.style.display = 'none';
    showAuth();
  }

  // ==================== MAIN APP ====================
  function init() {
    // Auth form handlers
    authBtnSubmit.addEventListener('click', handleAuth);
    authBtnSwitch.addEventListener('click', switchAuthMode);
    authPassword.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleAuth();
    });

    // Logout handlers
    document.querySelectorAll('.header-user').forEach(function(el) {
      el.addEventListener('click', handleLogout);
    });

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
    $('nav-prev').addEventListener('click', function() { shiftStats(-1); });
    $('nav-next').addEventListener('click', function() { shiftStats(1); });

    // Date picker: click label to pick date/month
    navLabel.addEventListener('click', function() {
      if (statsPeriod === 'day') {
        navLabel.style.display = 'none';
        navDateInput.style.display = '';
        navDateInput.value = statsYear + '-' +
          (statsMonth < 10 ? '0' : '') + statsMonth + '-' +
          (statsDay < 10 ? '0' : '') + statsDay;
        navDateInput.focus();
      } else if (statsPeriod === 'month') {
        navLabel.style.display = 'none';
        navMonthInput.style.display = '';
        navMonthInput.value = statsYear + '-' + (statsMonth < 10 ? '0' : '') + statsMonth;
        navMonthInput.focus();
      } else {
        var y = prompt('输入年份（如 2026）:', statsYear);
        if (y && !isNaN(y) && y > 2000 && y < 2100) {
          statsYear = parseInt(y);
          refreshStats();
        }
      }
    });

    navDateInput.addEventListener('change', function() {
      var parts = this.value.split('-');
      statsYear = parseInt(parts[0]);
      statsMonth = parseInt(parts[1]);
      statsDay = parseInt(parts[2]);
      navDateInput.style.display = 'none';
      navLabel.style.display = '';
      refreshStats();
    });
    navDateInput.addEventListener('blur', function() {
      setTimeout(function() {
        navDateInput.style.display = 'none';
        navLabel.style.display = '';
      }, 300);
    });

    navMonthInput.addEventListener('change', function() {
      var parts = this.value.split('-');
      statsYear = parseInt(parts[0]);
      statsMonth = parseInt(parts[1]);
      navMonthInput.style.display = 'none';
      navLabel.style.display = '';
      refreshStats();
    });
    navMonthInput.addEventListener('blur', function() {
      setTimeout(function() {
        navMonthInput.style.display = 'none';
        navLabel.style.display = '';
      }, 300);
    });

    // Edit modal
    btnEditSave.addEventListener('click', saveEdit);
    btnEditCancel.addEventListener('click', closeEditModal);
    modalOverlay.addEventListener('click', closeEditModal);

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
          voiceBtn.classList.remove('listening');
          voiceTranscript.className = 'voice-transcript';
          voiceTranscript.textContent = '';
          voiceTranscript.style.display = 'none';
          voiceHint.textContent = '点按录音，说出你的消费';
          if (batchMode.checked) {
            parseBatchResult(result);
          } else {
            parseVoiceResult(result);
          }
        },
        function(text, isFinal) {
          voiceTranscript.textContent = text || '...';
          voiceTranscript.className = 'voice-transcript' + (isFinal ? '' : ' is-interim');
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

    // Batch mode toggle
    batchMode.addEventListener('change', function() {
      if (!this.checked) {
        batchResults.style.display = 'none';
        batchSwitchLabel.classList.remove('has-batch');
        _batchItems = [];
      }
    });

    // Save button
    btnSave.addEventListener('click', saveRecord);

    // Enter to save
    inputDesc.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') saveRecord();
    });

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function() {});
    }

    // Try auto-login
    var autoUser = Auth.tryAutoLogin();
    if (autoUser) {
      showMain(autoUser);
    } else {
      showAuth();
    }
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

    var amountMatch = text.match(/(\d+\.?\d*)\s*(块|元|块钱|元钱|¥|￥)/);
    if (!amountMatch) {
      amountMatch = text.match(/(\d+\.?\d*)/);
    }
    if (amountMatch && !inputAmount.value) {
      inputAmount.value = parseFloat(amountMatch[1]);
    }

    if (!inputCategory.value) {
      var result = Classifier.classify(text);
      toast('已自动分类为: ' + Classifier.getIcon(result.category) + ' ' + result.category);
    }

    inputAmount.focus();

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

    var saved = Storage.save(record);

    // Verify save
    var all = Storage.getAll();
    var verified = all.some(function(r) { return r.id === saved.id; });
    if (!verified) {
      toast('⚠️ 保存异常，请重试');
      return;
    }

    inputAmount.value = '';
    inputDesc.value = '';
    inputCategory.value = '';
    inputDate.value = new Date().toISOString().slice(0, 10);

    toast('✅ 已记录 ' + Classifier.getIcon(category) + ' ¥' + amount.toFixed(2));
    if (currentTab === 'list') refreshList();
    if (currentTab === 'stats') refreshStats();
  }

  // ---- Batch mode ----
  function parseBatchResult(text) {
    if (!text) return;

    var segments = text.split(/[,，、;；]|\s+还有\s+|\s+然后\s+|\s+接着\s+|\s+另外\s+/g);

    var items = [];
    segments.forEach(function(seg) {
      seg = seg.trim();
      if (!seg) return;
      if (seg.length < 2) return;

      var amtMatch = seg.match(/(\d+\.?\d*)\s*(块|元|块钱|元钱|¥|￥)/);
      if (!amtMatch) amtMatch = seg.match(/(\d+\.?\d*)/);
      if (!amtMatch) return;

      var amount = parseFloat(amtMatch[1]);
      if (!amount || amount <= 0) return;

      var desc = seg.replace(amtMatch[0], '').replace(/花了|用了|消费了|买了|给了/g, '').trim();
      if (!desc) desc = seg;

      var result = Classifier.classify(desc);
      items.push({
        amount: amount,
        description: desc,
        category: result.category,
        confidence: result.confidence
      });
    });

    if (items.length === 0) {
      toast('未识别到消费记录，请重新说一遍');
      return;
    }

    renderBatchResults(items);
  }

  function renderBatchResults(items) {
    _batchItems = items;

    var html = '';
    items.forEach(function(item, i) {
      html += '<div class="batch-item">' +
        '<div class="batch-cat-icon">' + Classifier.getIcon(item.category) + '</div>' +
        '<div class="batch-info">' +
          '<div class="batch-desc">' + esc(item.description) + '</div>' +
          '<div class="batch-cat">' + item.category + '</div>' +
        '</div>' +
        '<div class="batch-amount">¥' + item.amount.toFixed(2) + '</div>' +
        '<button class="batch-remove" data-idx="' + i + '">✕</button>' +
        '</div>';
    });
    html += '<button class="batch-save-btn" id="btn-batch-save">✅ 全部保存 (' + items.length + '笔)</button>';

    batchResults.innerHTML = html;
    batchResults.style.display = 'block';
    batchSwitchLabel.classList.add('has-batch');

    batchResults.querySelectorAll('.batch-remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.idx);
        _batchItems.splice(idx, 1);
        if (_batchItems.length === 0) {
          batchResults.style.display = 'none';
          batchSwitchLabel.classList.remove('has-batch');
          _batchItems = [];
        } else {
          renderBatchResults(_batchItems);
        }
      });
    });

    var saveBtn = batchResults.querySelector('#btn-batch-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveAllBatch);
    }
  }

  function saveAllBatch() {
    if (!_batchItems || _batchItems.length === 0) return;

    var date = inputDate.value || new Date().toISOString().slice(0, 10);
    _batchItems.forEach(function(item) {
      Storage.save({
        amount: item.amount,
        description: item.description,
        category: item.category,
        date: date
      });
    });

    toast('✅ 已保存 ' + _batchItems.length + ' 笔记录');
    batchResults.style.display = 'none';
    batchSwitchLabel.classList.remove('has-batch');
    _batchItems = [];

    inputAmount.value = '';
    inputDesc.value = '';
    inputCategory.value = '';

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
          '<button class="btn-edit" data-id="' + r.id + '">✏️</button>' +
          '<button class="btn-delete" data-id="' + r.id + '">🗑</button>' +
          '</div>';
      });
      html += '</div>';
    });

    expenseList.innerHTML = html;

    expenseList.querySelectorAll('.btn-delete').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('确定删除这条记录吗？')) {
          Storage.remove(this.dataset.id);
          refreshList();
        }
      });
    });

    expenseList.querySelectorAll('.btn-edit').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openEditModal(this.dataset.id);
      });
    });
  }

  // ---- Edit Modal ----
  function openEditModal(id) {
    var records = Storage.getAll();
    var record = null;
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) { record = records[i]; break; }
    }
    if (!record) return;

    _editingId = id;
    editAmount.value = record.amount;
    editDesc.value = record.description;
    editDate.value = record.date;
    editCategory.value = record.category;
    editModal.style.display = 'flex';
  }

  function closeEditModal() {
    editModal.style.display = 'none';
    _editingId = null;
  }

  function saveEdit() {
    var amount = parseFloat(editAmount.value);
    var desc = editDesc.value.trim();
    if (!amount || amount <= 0) { toast('请输入金额'); return; }
    if (!desc) { toast('请输入消费内容'); return; }

    Storage.update(_editingId, {
      amount: amount,
      description: desc,
      category: editCategory.value,
      date: editDate.value
    });

    closeEditModal();
    toast('✅ 已修改');
    refreshList();
    if (currentTab === 'stats') refreshStats();
  }

  // ---- Statistics ----
  function refreshStats() {
    var records;

    if (statsPeriod === 'day') {
      records = Storage.getByDay(statsYear, statsMonth, statsDay);
      navLabel.textContent = statsYear + '年' + statsMonth + '月' + statsDay + '日';
    } else if (statsPeriod === 'month') {
      records = Storage.getByMonth(statsYear, statsMonth);
      navLabel.textContent = statsYear + '年' + statsMonth + '月';
    } else {
      records = Storage.getByYear(statsYear);
      navLabel.textContent = statsYear + '年';
    }

    var total = records.reduce(function(s, r) { return s + r.amount; }, 0);
    statTotal.textContent = '¥' + total.toFixed(2);
    statCount.textContent = records.length;

    if (statsPeriod === 'day') {
      // Daily: no average needed, hide the avg stat
      statAvg.textContent = '—';
      statAvgLabel.textContent = '当天';
      statAvg.parentElement.style.display = '';
    } else if (statsPeriod === 'month') {
      var daysInMonth = new Date(statsYear, statsMonth, 0).getDate();
      statAvg.textContent = '¥' + (records.length ? (total / daysInMonth).toFixed(2) : '0');
      statAvgLabel.textContent = '日均';
      statAvg.parentElement.style.display = '';
    } else {
      // Yearly: total / days in year (not months!)
      var daysInYear = isLeapYear(statsYear) ? 366 : 365;
      var now = new Date();
      if (statsYear === now.getFullYear()) {
        var start = new Date(statsYear, 0, 1);
        daysInYear = Math.floor((now - start) / 86400000) + 1;
      }
      statAvg.textContent = '¥' + (records.length ? (total / daysInYear).toFixed(2) : '0');
      statAvgLabel.textContent = '日均';
      statAvg.parentElement.style.display = '';
    }

    $('stats-nav').style.display = 'flex';

    if (statsPeriod === 'day') {
      // Day mode: show detail list instead of charts
      document.querySelectorAll('#tab-stats .chart-container').forEach(function(el) { el.style.display = 'none'; });
      Charts.destroyAll();
      renderDayDetail(records);
    } else {
      document.querySelectorAll('#tab-stats .chart-container').forEach(function(el) { el.style.display = ''; });
      dayDetailContainer.style.display = 'none';
      Charts.renderPie('pie-chart', records);
      Charts.renderBar('bar-chart', records, statsPeriod, statsYear, statsMonth);
    }
  }

  function renderDayDetail(records) {
    dayDetailContainer.style.display = 'block';
    if (records.length === 0) {
      dayDetailContainer.innerHTML = '<div class="card" style="text-align:center;color:var(--text-secondary);padding:24px;">当天没有消费记录</div>';
      return;
    }
    var html = '';
    records.forEach(function(r) {
      var icon = Classifier.getIcon(r.category);
      var catClass = getCatClass(r.category);
      html += '<div class="expense-item">' +
        '<div class="cat-icon ' + catClass + '">' + icon + '</div>' +
        '<div class="item-info"><div class="item-desc">' + esc(r.description) + '</div>' +
        '<div class="item-meta">' + r.category + '</div></div>' +
        '<div class="item-amount">¥' + r.amount.toFixed(2) + '</div>' +
        '</div>';
    });
    dayDetailContainer.innerHTML = html;
  }

  function shiftStats(dir) {
    if (statsPeriod === 'day') {
      var d = new Date(statsYear, statsMonth - 1, statsDay + dir);
      statsYear = d.getFullYear();
      statsMonth = d.getMonth() + 1;
      statsDay = d.getDate();
    } else if (statsPeriod === 'month') {
      statsMonth += dir;
      if (statsMonth > 12) { statsMonth = 1; statsYear++; }
      if (statsMonth < 1) { statsMonth = 12; statsYear--; }
    } else {
      statsYear += dir;
    }
    refreshStats();
  }

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
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

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
