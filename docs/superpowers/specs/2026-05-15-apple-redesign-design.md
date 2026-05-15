# 小账本 Apple 风格重设计

## 目标

将小账本 PWA 的视觉设计从通用 iOS 风格升级为更纯正的 Apple 原生质感，
跟随系统浅色/深色主题自动切换，保持现有功能完整不变。

## 设计语言

- **规范**: iOS Human Interface Guidelines
- **主题**: `prefers-color-scheme` 自动切换浅色/深色
- **字体**: 系统字体栈 (SF Pro / PingFang SC)，数字使用 SF Mono 等宽字体
- **颜色**: iOS 系统色 — systemBlue `#007AFF`, systemRed `#FF3B30`, systemGreen `#34C759`, systemGray

## 颜色系统

### 浅色模式 (light)

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg` | `#F2F2F7` | 页面背景 |
| `--card` | `#FFFFFF` | 卡片背景 |
| `--text` | `#000000` | 主文字 |
| `--text-secondary` | `#8E8E93` | 次要文字/标签 |
| `--accent` | `#007AFF` | 主强调色/系统蓝 |
| `--red` | `#FF3B30` | 支出金额色 |
| `--green` | `#34C759` | 收入金额色 |
| `--fill` | `#F2F2F7` | 输入框/填充背景 |
| `--fill-secondary` | `#E5E5EA` | 分段控件背景 |
| `--separator` | `rgba(60,60,67,0.1)` | 分割线 |

### 深色模式 (dark)

所有颜色对应反转为深色调：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg` | `#000000` | 页面背景 |
| `--card` | `#1C1C1E` | 卡片背景 |
| `--text` | `#FFFFFF` | 主文字 |
| `--text-secondary` | `#8E8E93` | 次要文字 |
| `--accent` | `#0A84FF` | 主强调色 |
| `--red` | `#FF453A` | 支出金额色 |
| `--green` | `#30D158` | 收入金额色 |
| `--fill` | `#1C1C1E` | 输入框背景 |
| `--fill-secondary` | `#2C2C2E` | 分段控件背景 |
| `--separator` | `rgba(84,84,88,0.65)` | 分割线 |

## 分类图标背景色

使用柔和的浅色背景 + emoji 图标（不受主题影响，浅/深色模式通用）:

| 分类 | 背景色 |
|------|--------|
| 餐饮 | `#FFE5D9` |
| 交通 | `#D9E6FF` |
| 购物 | `#FFD9F0` |
| 娱乐 | `#D9F0E4` |
| 住房 | `#FFF0D9` |
| 医疗 | `#FFD9D9` |
| 教育 | `#E5D9FF` |
| 其他/收入 | `#E5E5EA` |

## 各页面设计

### 登录页

- 页面居中布局，垂直排列
- Logo: 56px emoji 钱袋，88x88 白色圆角方形 (24px radius)，微阴影
- 标题: "小账本" 26px Bold
- 副标题: "登录你的账户" 14px 灰色
- 输入框: 无边框，`--fill` 背景，12px 圆角，14px padding
- 按钮: 主按钮系统蓝实心，次按钮透明+蓝色文字
- 勾选框: accent-color 蓝色

### 记账页 (tab-add)

- 大标题 "记一笔" 32px Bold
- 右上用户头像圆形按钮
- 收支切换: iOS Segmented Control 风格，`--fill-secondary` 底 + 白色选中项
- 语音按钮: 76px 蓝色圆形，居中，录音时变红+pulse动画
- 输入卡片: 白色圆角 16px，极浅阴影 `0 1px 3px rgba(0,0,0,0.04)`
  - 金额输入框大号字体 20px，灰色填充，无边框
  - 描述和分类同理
  - "记下" 按钮系统蓝
- 批量模式开关在卡片上方
- 底部提示文字灰色小字

### 账单页 (tab-list)

- 大标题 "账单" 32px Bold
- 筛选栏: 三个标签 (全部/支出/收入)，选中项底部蓝色短线
- 日期分组: 灰色小字 sticky 吸顶
- 记录条目: 白色卡片 14px 圆角，左侧分类图标，右侧 SF Mono 金额
- 支出红色、收入绿色
- 编辑/删除按钮右端

### 统计页 (tab-stats)

- 大标题 "统计" 32px Bold
- 周期选择: 蓝色实心选中态 pill 按钮
- 月份导航: 圆形箭头按钮 + 日期标签 (可点击弹出原生 picker)
- 汇总卡片: 白色圆角 16px，三列居中
- 图表: Chart.js 饼图+柱状图，白色圆角卡片容器

### 编辑弹窗

- 底部滑出 sheet 样式，圆角顶部
- 半透明遮罩 + backdrop-filter blur
- 表单字段与记账页一致

### Tab Bar

- 毛玻璃效果: `backdrop-filter: blur(20px)` + 半透明背景
- 0.5px 顶部分割线
- 三个 tab 图标+文字，选中项蓝色

## 技术约束

- **纯 CSS 改造**：只改 `style.css`，不碰 HTML 结构和 JS 逻辑
- **CSS 变量**：使用 `:root` 和 `@media (prefers-color-scheme: dark)` 实现主题切换
- **不引入新依赖**：现有 Chart.js CDN 保留
- **PWA 兼容**：保留 safe-area-inset 处理
- **性能**：CSS 动画优先，避免重绘

## 不做的事

- 不改 HTML 结构
- 不改 JS 逻辑
- 不新增功能
- 不删减功能
- 分类颜色/图标映射保持不变
