# ExtendScript 模块化架构规范

## 1. 范围 / 触发条件

**触发条件:** ExtendScript 项目需要模块化重构以提高可维护性

**适用场景:**
- 大型单体文件（>500 行）
- 代码重复严重
- 多个文件实例化相同对象
- 缺乏清晰的模块边界

## 2. 架构签名

### 模块加载顺序（main.jsx）

```javascript
// 1. 工具模块（必须首先加载）
// @include "constants.jsx"
// @include "polyfills.jsx"
// @include "stringutils.jsx"
// @include "arrayutils.jsx"
// @include "formatutils.jsx"
// @include "errorhandler.jsx"

// 2. 核心模块
// @include "platform.jsx"
// @include "platformsingleton.jsx"
// @include "common.jsx"

// 3. 业务模块
// @include "icons.jsx"
// @include "settings.jsx"
// ... 其他模块
```

### 模块结构签名

```javascript
/**
 * @module modulename
 * @description 模块功能描述
 * @dependencies dependency1.jsx, dependency2.jsx
 */

// 模块实现
```

## 3. 契约

### 工具模块契约

**constants.jsx:**
- 导出: 全局常量（UPPER_SNAKE_CASE）
- 依赖: 无
- 用途: 消除魔法数字

**polyfills.jsx:**
- 导出: JSON, String.prototype.trim, Array.prototype.indexOf
- 依赖: 无
- 用途: 提供 ES5 功能

**stringutils.jsx:**
- 导出: getPadding, pad, ellipsis, fileNameSafeString 等
- 依赖: constants.jsx
- 用途: 字符串操作

**arrayutils.jsx:**
- 导出: uniq, getArrayFromRange, getRanges
- 依赖: 无
- 用途: 数组操作

**formatutils.jsx:**
- 导出: formatBytes
- 依赖: constants.jsx
- 用途: 格式化函数

**errorhandler.jsx:**
- 导出: alertScroll, catchError
- 依赖: constants.jsx, stringutils.jsx
- 用途: 错误处理

### 单例模式契约

**platformsingleton.jsx:**
```javascript
// 签名
function getPlatform(): Platform

// 契约
- 返回: 单例 Platform 实例
- 首次调用: 创建新实例
- 后续调用: 返回相同实例
- 线程安全: ExtendScript 单线程，无需锁
```

### 辅助函数契约

**mainwindow.jsx 辅助函数:**

```javascript
// 签名
function getCurrentOutputModule(): OutputModule | null

// 契约
- 前置条件: listItem.selection 存在
- 返回: 当前选中的输出模块或 null
- 副作用: 无

// 签名
function getPathcontrolForSelection(): Pathcontrol | null

// 契约
- 前置条件: listItem.selection 存在
- 返回: 初始化的 Pathcontrol 或 null
- 副作用: 创建新 Pathcontrol 实例

// 签名
function refreshUI(): void

// 契约
- 前置条件: 无
- 返回: void
- 副作用: 清除并刷新 UI
```

## 4. 验证和错误矩阵

### 加载顺序验证

| 条件 | 错误 |
|------|------|
| 工具模块未首先加载 | ReferenceError: 函数未定义 |
| 依赖模块未加载 | ReferenceError: 依赖未定义 |
| 循环依赖 | 未定义行为 |

### 单例模式验证

| 条件 | 结果 |
|------|------|
| 首次调用 getPlatform() | 创建新实例 |
| 第二次调用 getPlatform() | 返回相同实例 |
| 直接使用 new Platform() | ❌ 创建重复实例 |

### 辅助函数验证

| 条件 | 结果 |
|------|------|
| listItem.selection 为 null | 返回 null |
| 输出模块不存在 | 返回 null |
| 输出模块存在 | 返回有效对象 |

## 5. Good/Base/Bad 案例

### Good: 正确的模块加载

```javascript
// main.jsx
(function(thisObj) {
  // ✅ 正确: 工具模块首先加载
  // @include "constants.jsx"
  // @include "polyfills.jsx"
  // @include "stringutils.jsx"

  // ✅ 正确: 核心模块其次
  // @include "platform.jsx"
  // @include "platformsingleton.jsx"

  // ✅ 正确: 业务模块最后
  // @include "mainwindow.jsx"

  // ✅ 正确: 使用单例
  var platform = getPlatform();
}(renderQueuePlus));
```

### Base: 基本模块结构

```javascript
/**
 * @module mymodule
 * @description 模块功能描述
 * @dependencies constants.jsx
 */

// ✅ 使用常量
var MAX_LENGTH = DEFAULT_ELLIPSIS_LENGTH;

// ✅ 文档化的函数
/**
 * 处理输入
 * @param {string} input 输入字符串
 * @return {string} 处理后的字符串
 */
function processInput(input) {
  return input.trim();
}
```

### Bad: 错误的模式

```javascript
// ❌ 错误: 业务模块在工具模块之前
// @include "mainwindow.jsx"
// @include "constants.jsx"  // 太晚了！

// ❌ 错误: 创建多个 Platform 实例
var platform1 = new Platform();
var platform2 = new Platform();  // 浪费资源

// ❌ 错误: 重复代码
var omItem = data.getOutputModule(
  data.item(listItem.selection.index).rqIndex,
  data.item(listItem.selection.index).omIndex
);
// 应该使用: var omItem = getCurrentOutputModule();

// ❌ 错误: 魔法数字
if (padding === 5) { ... }
// 应该使用: if (padding === PADDING_5_DIGITS) { ... }
```

## 6. 必需的测试

### 单元测试（手动）

**测试点:**
1. 模块加载顺序
   - 断言: 所有模块无错误加载
   - 方法: 在 ExtendScript Toolkit 中运行

2. 单例模式
   - 断言: getPlatform() 始终返回相同实例
   - 方法: 比较对象引用

3. 辅助函数
   - 断言: getCurrentOutputModule() 返回正确对象或 null
   - 方法: 测试有/无选择的情况

### 集成测试（手动）

**测试点:**
1. 面板加载
   - 断言: 面板在 After Effects 中无错误显示
   - 方法: 打开 After Effects，加载面板

2. 功能完整性
   - 断言: 所有按钮功能正常
   - 方法: 点击每个按钮，验证行为

3. 跨平台
   - 断言: Windows 和 Mac 上行为一致
   - 方法: 在两个平台上测试

## 7. 错误 vs 正确

### 错误: 直接实例化 Platform

```javascript
// ❌ 错误
function myFunction() {
  var platform = new Platform();  // 每次调用创建新实例
  if (platform.isWindows) {
    // ...
  }
}
```

**问题:**
- 每次调用创建新实例
- 浪费内存和 CPU
- 11 个实例分散在代码中

### 正确: 使用单例

```javascript
// ✅ 正确
function myFunction() {
  var platform = getPlatform();  // 返回共享实例
  if (platform.isWindows) {
    // ...
  }
}
```

**优势:**
- 单个共享实例
- 减少内存占用
- 一致的平台检测

### 错误: 重复的输出模块检索

```javascript
// ❌ 错误
function processOutput() {
  var omItem = data.getOutputModule(
    data.item(listItem.selection.index).rqIndex,
    data.item(listItem.selection.index).omIndex
  );

  if (omItem === null) {
    cls.prototype.clear();
    refreshButton_onClick();
    return;
  }

  var pathcontrol = new Pathcontrol();
  pathcontrol.initFromOutputModule(omItem);
  // ... 使用 pathcontrol
}
```

**问题:**
- 代码重复 10+ 次
- 难以维护
- 容易出错

### 正确: 使用辅助函数

```javascript
// ✅ 正确
function processOutput() {
  var omItem = getCurrentOutputModule();

  if (omItem === null) {
    refreshUI();
    return;
  }

  var pathcontrol = getPathcontrolForSelection();
  // ... 使用 pathcontrol
}
```

**优势:**
- 代码简洁
- 单一真实来源
- 易于维护和修改

## 设计决策

### 决策 1: 工具模块优先加载

**上下文:** ExtendScript 使用全局命名空间，没有模块系统

**考虑的选项:**
1. 按字母顺序加载
2. 按功能分组加载
3. 按依赖关系加载

**决策:** 按依赖关系加载（工具 → 核心 → 业务）

**原因:**
- 确保依赖在使用前可用
- 清晰的模块层次
- 避免 ReferenceError

### 决策 2: 单例模式用于 Platform

**上下文:** Platform 对象在 11 个地方被实例化

**考虑的选项:**
1. 保持多个实例
2. 全局变量
3. 单例模式

**决策:** 单例模式

**原因:**
- 减少内存占用
- 一致的平台检测
- 易于测试和模拟
- 遵循最佳实践

### 决策 3: 辅助函数而非完全拆分

**上下文:** mainwindow.jsx 有 1715 行，代码重复严重

**考虑的选项:**
1. 完全拆分为多个文件
2. 添加辅助函数
3. 保持原样

**决策:** 添加辅助函数（阶段性方法）

**原因:**
- 低风险，高回报
- 保持向后兼容
- 显著减少重复
- 为未来拆分奠定基础

## 扩展性

### 添加新工具模块

1. 创建新的 .jsx 文件
2. 添加模块头注释
3. 在 main.jsx 中正确位置添加 @include
4. 更新依赖文档

### 添加新辅助函数

1. 识别重复模式（3+ 次）
2. 提取为函数
3. 添加 JSDoc 注释
4. 替换所有重复代码

### 迁移到完全模块化

如果需要进一步拆分：
1. 从 Phase 3 的辅助函数开始
2. 提取 UI 构建代码
3. 提取事件处理器
4. 提取脚本生成逻辑
5. 保持 mainwindow.jsx 作为协调器

## 常见错误

### 错误 1: 忘记更新 main.jsx

**症状:** ReferenceError: 函数未定义

**原因:** 创建新模块但未在 main.jsx 中包含

**修复:**
```javascript
// 在 main.jsx 中添加
// @include "newmodule.jsx"
```

### 错误 2: 错误的加载顺序

**症状:** ReferenceError: 依赖未定义

**原因:** 模块在其依赖之前加载

**修复:** 确保依赖首先加载

### 错误 3: 使用 new Platform()

**症状:** 多个 Platform 实例

**原因:** 直接实例化而非使用单例

**修复:**
```javascript
// ❌ 错误
var platform = new Platform();

// ✅ 正确
var platform = getPlatform();
```

## 相关规范

- [编码约定](./coding-conventions.md) - 命名和风格指南
- [跨平台开发](./cross-platform.md) - 平台特定代码
- [常见错误](./common-mistakes.md) - 已知陷阱
