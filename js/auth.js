var Auth = (function() {
  'use strict';

  var USERS_KEY = 'xiaozhangben_users';
  var SESSION_KEY = 'xiaozhangben_session';

  function _readUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch(e) { return []; }
  }

  function _writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function _hash(str) {
    // Simple hash for local-only privacy (not a banking app)
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return 'h_' + Math.abs(h).toString(36) + '_' + str.length;
  }

  function register(username, password) {
    if (!username || !password) return { ok: false, error: '请输入用户名和密码' };
    if (username.length < 2) return { ok: false, error: '用户名至少2个字' };
    if (password.length < 3) return { ok: false, error: '密码至少3位' };

    var users = _readUsers();
    var exists = users.some(function(u) { return u.username === username; });
    if (exists) return { ok: false, error: '该用户名已被注册' };

    var user = {
      id: 'u_' + Date.now().toString(36),
      username: username,
      password: _hash(password),
      createdAt: new Date().toISOString()
    };
    users.push(user);
    _writeUsers(users);
    return { ok: true, user: { id: user.id, username: user.username } };
  }

  function login(username, password, remember, autoLogin) {
    var users = _readUsers();
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username && users[i].password === _hash(password)) {
        user = users[i];
        break;
      }
    }
    if (!user) return { ok: false, error: '用户名或密码错误' };

    var session = {
      userId: user.id,
      username: user.username,
      remember: !!remember,
      autoLogin: !!autoLogin,
      loginTime: Date.now()
    };
    if (remember || autoLogin) {
      session.passwordHash = _hash(password);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: { id: user.id, username: user.username } };
  }

  function logout() {
    var session = getSession();
    if (session && !session.remember && !session.autoLogin) {
      localStorage.removeItem(SESSION_KEY);
    } else if (session) {
      // Keep session for auto-login but clear sensitive data
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch(e) { return null; }
  }

  function tryAutoLogin() {
    var session = getSession();
    if (!session || !session.autoLogin) return null;
    if (!session.username || !session.passwordHash) return null;

    var users = _readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === session.username &&
          users[i].password === session.passwordHash) {
        return { id: users[i].id, username: users[i].username };
      }
    }
    return null;
  }

  return {
    register: register,
    login: login,
    logout: logout,
    getSession: getSession,
    tryAutoLogin: tryAutoLogin
  };
})();
