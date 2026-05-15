var Storage = (function() {
  'use strict';

  var KEY_PREFIX = 'xiaozhangben_data_';
  var _userId = null;

  function setUser(userId) {
    _userId = userId;
  }

  function _key() {
    return KEY_PREFIX + (_userId || 'default');
  }

  function _read() {
    try {
      return JSON.parse(localStorage.getItem(_key())) || [];
    } catch (e) {
      return [];
    }
  }

  function _write(records) {
    localStorage.setItem(_key(), JSON.stringify(records));
  }

  function save(record) {
    var records = _read();
    var now = new Date().toISOString();
    var newRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: parseFloat(record.amount) || 0,
      description: (record.description || '').trim(),
      category: record.category || '其他',
      type: record.type || 'expense',
      date: record.date || new Date().toISOString().slice(0, 10),
      createdAt: now
    };
    records.unshift(newRecord);
    _write(records);
    return newRecord;
  }

  function getAll() {
    return _read();
  }

  function getByMonth(year, month) {
    var prefix = year + '-' + (month < 10 ? '0' + month : month);
    return _read().filter(function(r) {
      return r.date.slice(0, 7) === prefix;
    });
  }

  function getByYear(year) {
    var prefix = String(year);
    return _read().filter(function(r) {
      return r.date.slice(0, 4) === prefix;
    });
  }

  function getByDay(year, month, day) {
    var target = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    return _read().filter(function(r) { return r.date === target; });
  }

  function remove(id) {
    var records = _read().filter(function(r) { return r.id !== id; });
    _write(records);
  }

  function update(id, changes) {
    var records = _read();
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) {
        Object.assign(records[i], changes);
        break;
      }
    }
    _write(records);
  }

  function exportData() {
    return JSON.stringify(_read(), null, 2);
  }

  function importData(json) {
    var data = JSON.parse(json);
    if (!Array.isArray(data)) throw new Error('格式错误');
    _write(data);
  }

  function count() {
    return _read().length;
  }

  return {
    setUser: setUser,
    save: save,
    getAll: getAll,
    getByMonth: getByMonth,
    getByYear: getByYear,
    getByDay: getByDay,
    remove: remove,
    update: update,
    exportData: exportData,
    importData: importData,
    count: count
  };
})();
