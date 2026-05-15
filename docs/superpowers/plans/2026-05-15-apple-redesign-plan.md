# Apple 风格重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将小账本 PWA 的 style.css 重写为 Apple/iOS 原生设计风格，支持浅色/深色自动切换。

**Architecture:** 纯 CSS 改造。使用 CSS 自定义属性（变量）+ `@media (prefers-color-scheme: dark)` 实现主题跟随系统。不改动 HTML 结构和 JS 逻辑。

**Tech Stack:** CSS3 (变量、媒体查询、backdrop-filter、动画)

---

### Task 1: CSS 变量与基础重置

**Files:**
- Modify: `css/style.css` (完整重写)

- [ ] **Step 1: 写入 CSS 变量、reset、body、#app 基础样式**

将 `css/style.css` 完整替换为以下内容:

```css
/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue: #007AFF;
  --green: #34C759;
  --red: #FF3B30;
  --orange: #FF9500;
  --bg: #F2F2F7;
  --card: #FFFFFF;
  --text: #000000;
  --text-secondary: #8E8E93;
  --fill: #F2F2F7;
  --fill-secondary: #E5E5EA;
  --separator: rgba(60,60,67,0.1);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --card: #1C1C1E;
    --text: #FFFFFF;
    --text-secondary: #8E8E93;
    --fill: #1C1C1E;
    --fill-secondary: #2C2C2E;
    --separator: rgba(84,84,88,0.65);
    --blue: #0A84FF;
    --green: #30D158;
    --red: #FF453A;
    --orange: #FF9F0A;
  }
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", "PingFang SC", sans-serif;
  font-size: 16px;
  color: var(--text);
  background: var(--bg);
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
  overflow: hidden;
}

#app {
  max-width: 430px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg);
}
```

- [ ] **Step 2: 在浏览器中打开 index.html，确认无报错，背景色正确**

不需要单独测试命令，用浏览器打开 `index.html` 检查页面加载无 CSS 报错即可。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: add Apple-style CSS variables and base reset with dark mode support"
```

---

### Task 2: 登录页样式

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 在 style.css 末尾追加登录页样式**

```css
/* === Auth Page === */
.auth-page {
  flex: 1;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 16px;
}
.auth-page.active { display: flex; }

.auth-logo {
  font-size: 48px;
  width: 80px; height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card);
  border-radius: 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.auth-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: -8px;
}

.auth-card {
  width: 100%;
  background: var(--card);
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.auth-input {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background: var(--fill);
  color: var(--text);
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 12px;
}
.auth-input:focus { background: var(--fill-secondary); }

.auth-check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.auth-check-row input[type=checkbox] {
  width: 18px; height: 18px;
  accent-color: var(--blue);
}
.auth-check-row label { flex: 1; }

.auth-btn {
  width: 100%;
  padding: 14px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
}
.auth-btn:active { opacity: 0.7; }
.auth-btn.outline {
  background: none;
  color: var(--blue);
  font-weight: 500;
}
.auth-btn.outline:active { background: var(--fill); }
.auth-error {
  color: var(--red);
  font-size: 13px;
  text-align: center;
  min-height: 20px;
}
```

- [ ] **Step 2: 验证登录页外观**

在浏览器中打开 `index.html`，检查登录页: Logo、标题、输入框圆角无边框、按钮蓝色。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: redesign auth page with Apple iOS aesthetic"
```

---

### Task 3: 主容器、Header、Tab Bar

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 追加主容器、页面头部、底部标签栏样式**

```css
/* === Main Container === */
.main-container {
  flex: 1;
  display: none;
  flex-direction: column;
  height: 100%;
}
.main-container.active { display: flex; }

/* === Header === */
.page-header {
  padding: 14px 20px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.page-header .header-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}
.page-header .header-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--card);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.page-header .header-user .logout-icon { font-size: 14px; opacity: 0.6; }
.page-header .header-user:active { background: var(--fill); }

/* === Tab Pages === */
.tab-page {
  flex: 1;
  overflow-y: auto;
  display: none;
  flex-direction: column;
  padding: 0 20px 20px;
  -webkit-overflow-scrolling: touch;
}
.tab-page.active { display: flex; }

/* === Bottom Tab Bar (frosted glass) === */
.tab-bar {
  display: flex;
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid var(--separator);
  padding: 6px 0 4px;
  padding-bottom: var(--safe-bottom);
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .tab-bar {
    background: rgba(28,28,30,0.72);
  }
}

.tab-btn {
  flex: 1;
  padding: 6px 0;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}
.tab-btn .tab-icon { font-size: 22px; }
.tab-btn.active { color: var(--blue); }
```

- [ ] **Step 2: 验证**

浏览器打开 index.html，登录后检查: 大标题 32px、Tab Bar 毛玻璃效果、三个标签切换蓝色高亮。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: add iOS-style header, tab bar with frosted glass effect"
```

---

### Task 4: 收支切换、语音按钮、表单

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 追加样式**

```css
/* === Segmented Control (支出/收入) === */
.type-toggle {
  display: flex;
  background: var(--fill-secondary);
  border-radius: 8.93px;
  padding: 2px;
  margin-bottom: 20px;
}
.type-toggle-btn {
  flex: 1;
  padding: 6px 0;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--text);
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.type-toggle-btn.active-expense {
  background: var(--card);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.04);
}
.type-toggle-btn.active-income {
  background: var(--green);
  color: #fff;
}

/* === Voice Area === */
.voice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 16px;
}
.voice-btn {
  width: 76px; height: 76px;
  border-radius: 50%;
  border: none;
  background: var(--blue);
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,122,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.voice-btn:active { transform: scale(0.94); }
.voice-btn.income-mode {
  background: var(--green);
  box-shadow: 0 4px 14px rgba(52,199,89,0.35);
}
.voice-btn.listening {
  background: var(--red);
  animation: pulse 1.5s infinite;
  box-shadow: 0 4px 20px rgba(255,59,48,0.45);
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,48,0.4); }
  50% { box-shadow: 0 0 0 18px rgba(255,59,48,0); }
}
.voice-hint {
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  min-height: 20px;
}

/* === Form Card === */
.card {
  background: var(--card);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
.form-row + .form-row { margin-top: 12px; }
.form-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background: var(--fill);
  color: var(--text);
  outline: none;
  -webkit-appearance: none;
}
.form-input:focus { background: var(--fill-secondary); }
.voice-transcript {
  background: var(--card);
  border: 2px solid var(--blue);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 12px;
  font-size: 16px;
  color: var(--text);
  min-height: 48px;
  text-align: center;
  word-break: break-all;
}
.voice-transcript.is-interim { color: var(--text-secondary); font-style: italic; }
.form-select {
  padding: 12px 14px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: var(--fill);
  color: var(--text);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238E8E93' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
  min-width: 0;
  flex-shrink: 1;
}
.form-select:focus { background: var(--fill-secondary); }
.btn-primary {
  padding: 12px 22px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.btn-primary:active { opacity: 0.7; }
```

- [ ] **Step 2: 验证**

浏览器中打开 index.html，切换到记账页，检查: Segmented Control、语音按钮蓝色圆形、输入框无边框灰底、记下按钮。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: redesign segmented control, voice button, and form inputs with iOS style"
```

---

### Task 5: 账单列表页样式

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 追加账单列表样式**

```css
/* === Category Tag === */
.cat-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: var(--fill);
  color: var(--text-secondary);
}

/* === Expense List === */
.list-filter {
  display: flex;
  gap: 0;
  padding: 8px 0 4px;
}
.list-filter-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}
.list-filter-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--blue);
  border-radius: 1px;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-filter-btn.active {
  color: var(--blue);
  font-weight: 600;
}
.list-filter-btn.active::after { width: 24px; }
.expense-group { margin-bottom: 20px; }
.expense-date {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 10px 0 6px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 1;
}
.expense-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--card);
  border-radius: 14px;
  margin-bottom: 8px;
  gap: 12px;
}
.expense-item .cat-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.expense-item .cat-icon.food { background: #FFE5D9; }
.expense-item .cat-icon.transport { background: #D9E6FF; }
.expense-item .cat-icon.shopping { background: #FFD9F0; }
.expense-item .cat-icon.entertainment { background: #D9F0E4; }
.expense-item .cat-icon.housing { background: #FFF0D9; }
.expense-item .cat-icon.medical { background: #FFD9D9; }
.expense-item .cat-icon.education { background: #E5D9FF; }
.expense-item .cat-icon.other { background: #E5E5EA; }

.expense-item .item-info { flex: 1; min-width: 0; }
.expense-item .item-desc {
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.expense-item .item-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}
.expense-item .item-amount {
  font-size: 17px;
  font-weight: 600;
  color: var(--red);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Menlo", "Consolas", monospace;
}
.expense-item .item-amount.income { color: var(--green); }
.expense-item .btn-delete {
  padding: 6px 8px;
  background: none;
  border: none;
  color: #C7C7CC;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
}
.expense-item .btn-delete:active { color: var(--red); }

/* === Empty State === */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: 10px;
}
.empty-state .empty-icon { font-size: 48px; opacity: 0.5; }
.empty-state .empty-text { font-size: 15px; }
```

- [ ] **Step 2: 验证**

浏览器中打开，切换到账单页，检查: 筛选栏底线指示、记录卡片圆角、分类图标彩色方块、金额等宽字体红/绿色。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: redesign expense list with Apple card style and SF Mono amounts"
```

---

### Task 6: 统计页样式

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 追加统计页样式**

```css
/* === Stats Page === */
.stats-header {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 0 16px;
}
.period-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 16px;
  background: var(--fill-secondary);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.period-btn.active {
  background: var(--blue);
  color: #fff;
}
.stats-summary {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 20px 0;
  margin-bottom: 16px;
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stat-item { text-align: center; }
.stat-item .stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Menlo", "Consolas", monospace;
}
.stat-item .stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  font-weight: 500;
}
.chart-container {
  background: var(--card);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  position: relative;
  min-height: 280px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.chart-container canvas { width: 100% !important; }

/* === Category Filter === */
.cat-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}
.cat-filter-chip {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  border: none;
  background: var(--fill-secondary);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}
.cat-filter-chip.active {
  background: var(--blue);
  color: #fff;
}

/* === Stats Type Row === */
.stats-type-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 0 12px;
}

/* === Month/Year Picker === */
.stats-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 4px 0 12px;
}
.stats-nav .nav-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--fill-secondary);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stats-nav .nav-btn:active { background: var(--fill); }
.stats-nav .nav-label {
  font-size: 17px;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  color: var(--text);
}
.stats-nav .nav-label:active { opacity: 0.6; }
.nav-date-input, .nav-month-input {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  border: none;
  background: transparent;
  color: var(--blue);
  font-family: inherit;
  min-width: 100px;
  padding: 4px 0;
  outline: none;
}
```

- [ ] **Step 2: 验证**

浏览器中打开，切换到统计页，检查: 周期按钮、月份导航圆形箭头、汇总卡片、图表容器。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: redesign stats page with iOS-style controls and SF Mono numbers"
```

---

### Task 7: 弹窗、编辑、批量模式、Toast

**Files:**
- Modify: `css/style.css` (追加)

- [ ] **Step 1: 追加剩余样式**

```css
/* === Modal === */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
.modal-content {
  position: relative;
  width: 100%;
  max-width: 430px;
  background: var(--card);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-content .form-row + .form-row { margin-top: 12px; }

/* Edit button */
.btn-edit {
  padding: 6px 8px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.btn-edit:active { opacity: 1; }

/* Cancel button */
.btn-cancel {
  padding: 12px 18px;
  background: var(--fill);
  color: var(--text);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.btn-cancel:active { background: var(--fill-secondary); }

/* === Batch Mode === */
.batch-toggle-row {
  display: flex;
  justify-content: center;
  padding: 0 0 12px;
}
.batch-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  background: var(--card);
  padding: 9px 18px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.batch-switch input[type=checkbox] {
  width: 18px; height: 18px;
  accent-color: var(--green);
}
.batch-switch.has-batch {
  color: var(--green);
  font-weight: 600;
}
.batch-results { margin-bottom: 12px; }
.batch-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--card);
  border-radius: 14px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.batch-item .batch-cat-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
}
.batch-item .batch-info { flex: 1; min-width: 0; }
.batch-item .batch-desc { font-size: 15px; font-weight: 500; color: var(--text); }
.batch-item .batch-cat { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.batch-item .batch-amount {
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.batch-item .batch-remove {
  padding: 6px 10px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}
.batch-item .batch-remove:active { color: var(--red); }
.batch-save-btn {
  width: 100%;
  padding: 14px;
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}
.batch-save-btn:active { opacity: 0.7; }

/* === Toast === */
.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #1C1C1E;
  color: #fff;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.toast.show { opacity: 1; }
@media (prefers-color-scheme: dark) {
  .toast {
    background: #FFFFFF;
    color: #000;
  }
}
```

- [ ] **Step 2: 验证**

浏览器中检查: 底部滑出弹窗、毛玻璃遮罩、记录编辑/删除按钮、批量模式、Toast 提示。

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "style: redesign modal, batch mode, and toast with iOS aesthetic"
```

---

### Task 8: 最终验证

**Files:**
- 全部 (只读检查)

- [ ] **Step 1: 全面走查所有页面**

在浏览器中打开 `index.html`，逐一检查:

1. **登录页**: 输入框、按钮、勾选框样式正确
2. **记账页**: Segmented Control、语音按钮、输入卡片、批量模式
3. **账单页**: 筛选栏、记录条目、金额颜色
4. **统计页**: 周期选择、汇总卡片、图表、导航
5. **弹窗**: 编辑弹窗底部滑出、毛玻璃遮罩
6. **Tab Bar**: 毛玻璃效果、蓝色选中态
7. **深色模式**: 在系统设置中切换深色模式，检查所有页面

- [ ] **Step 2: 使用验证技能确认完成**

```bash
# 确认 style.css 文件存在且内容完整
wc -l css/style.css
```

- [ ] **Step 3: 清理预览文件并提交**

```bash
rm style-preview.html
git add css/style.css
git rm style-preview.html 2>/dev/null
git commit -m "style: complete Apple iOS redesign, remove style preview"
```
```

---

## Self-Review

1. **Spec coverage**: 所有 spec 章节均已覆盖 — CSS 变量和主题 (Task 1)、登录页 (Task 2)、主容器/Header/Tab Bar (Task 3)、记账页 (Task 4)、账单页 (Task 5)、统计页 (Task 6)、弹窗/批量/Toast (Task 7)、最终验证 (Task 8)。

2. **Placeholder scan**: 无 TBD/TODO，所有步骤包含实际 CSS 代码。

3. **Type consistency**: 所有 CSS 变量名在全部 task 中一致使用 (`--bg`, `--card`, `--text`, `--blue`, `--green`, `--red`, `--fill`, `--fill-secondary`, `--text-secondary`, `--separator`)。
