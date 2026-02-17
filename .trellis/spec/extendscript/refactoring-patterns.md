# ExtendScript 重构模式

## 已验证的重构策略

本文档记录了在 RenderQueuePlus 项目中成功应用的重构模式。

## 模式 1: 渐进式模块提取

### 问题
大型单体文件（663 行 common.jsx）包含多种不相关的功能。

### 解决方案
按功能类型提取为专注的模块。

### 实施步骤

1. **识别功能组**
   ```
   common.jsx 分析:
   - 常量定义 → constants.jsx
   - Polyfills → polyfills.jsx
   - 字符串操作 → stringutils.jsx
   - 数组操作 → arrayutils.jsx
   - 格式化 → formatutils.jsx
   - 错误处理 → errorhandler.jsx
   - AE 特定功能 → 保留在 common.jsx
   ```

2. **创建新模块**
   ```javascript
   /**
    * @module constants
    * @description 全局常量
    * @dependencies 无
    */

   var PADDING_5_DIGITS = 5;
   var DEFAULT_ELLIPSIS_LENGTH = 100;
   ```

3. **更新依赖**
   ```javascript
   // stringutils.jsx 现在依赖 constants.jsx
   function ellipsis(inString, length) {
     if (!(length)) {
       var length = DEFAULT_ELLIPSIS_LENGTH;  // 使用常量
     }
     // ...
   }
   ```

4. **更新加载顺序**
   ```javascript
   // main.jsx
   // @include "constants.jsx"      // 首先
   // @include "stringutils.jsx"    // 其次（依赖 constants）
   ```

### 结果
- common.jsx: 663 → 251 行（-62%）
- 6 个专注的工具模块
- 清晰的依赖关系

### 何时使用
- 文件 >500 行
- 包含多种不相关功能
- 代码重用困难

## 模式 2: 单例模式消除重复实例化

### 问题
Platform 对象在 11 个地方被实例化，浪费资源。

### 解决方案
实现单例模式，提供全局访问点。

### 实施步骤

1. **创建单例模块**
   ```javascript
   /**
    * @module platformsingleton
    * @description Platform 单例包装器
    * @dependencies platform.jsx
    */

   var _platformInstance = null;

   function getPlatform() {
     if (_platformInstance === null) {
       _platformInstance = new Platform();
     }
     return _platformInstance;
   }
   ```

2. **替换所有实例化**
   ```javascript
   // ❌ 之前
   var platform = new Platform();

   // ✅ 之后
   var platform = getPlatform();
   ```

3. **搜索和替换**
   ```bash
   # 查找所有使用
   grep -r "new Platform()" *.jsx

   # 在每个文件中替换
   # directory.jsx, ffmpeg.jsx, settings.jsx, etc.
   ```

### 结果
- 11 个实例 → 1 个单例（-91%）
- 减少内存占用
- 一致的平台检测

### 何时使用
- 对象在多处实例化
- 对象无状态或共享状态
- 需要全局访问点

## 模式 3: 辅助函数消除代码重复

### 问题
相同的代码模式在 mainwindow.jsx 中重复 10+ 次。

### 解决方案
提取为辅助函数，提供单一真实来源。

### 实施步骤

1. **识别重复模式**
   ```javascript
   // 模式 1: 重复 10+ 次
   var omItem = data.getOutputModule(
     data.item(listItem.selection.index).rqIndex,
     data.item(listItem.selection.index).omIndex
   );

   // 模式 2: 重复 8+ 次
   var pathcontrol = new Pathcontrol();
   pathcontrol.initFromOutputModule(omItem);

   // 模式 3: 重复 5+ 次
   cls.prototype.clear();
   refreshButton_onClick();
   ```

2. **创建辅助函数**
   ```javascript
   /**
    * 获取当前输出模块
    * @return {OutputModule|null}
    */
   function getCurrentOutputModule() {
     if (!(listItem.selection)) {
       return null;
     }
     return data.getOutputModule(
       data.item(listItem.selection.index).rqIndex,
       data.item(listItem.selection.index).omIndex
     );
   }

   /**
    * 获取选择的路径控制
    * @return {Pathcontrol|null}
    */
   function getPathcontrolForSelection() {
     var omItem = getCurrentOutputModule();
     if (omItem === null) {
       return null;
     }
     var pathcontrol = new Pathcontrol();
     pathcontrol.initFromOutputModule(omItem);
     return pathcontrol;
   }

   /**
    * 刷新 UI
    */
   function refreshUI() {
     cls.prototype.clear();
     refreshButton_onClick();
   }
   ```

3. **替换所有重复代码**
   ```javascript
   // ❌ 之前
   function playButton_onClick() {
     if (!(listItem.selection)) {
       return;
     }

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
     // ...
   }

   // ✅ 之后
   function playButton_onClick() {
     if (!(listItem.selection)) {
       return;
     }

     var omItem = getCurrentOutputModule();

     if (omItem === null) {
       refreshUI();
       return;
     }

     var pathcontrol = getPathcontrolForSelection();
     // ...
   }
   ```

### 结果
- 减少 ~100 行重复代码
- 10 个函数更新
- 更易维护

### 何时使用
- 代码模式重复 3+ 次
- 模式有清晰的目的
- 提取不会破坏封装

## 模式 4: 阶段性重构方法

### 问题
大型重构风险高，难以测试和回滚。

### 解决方案
将重构分解为独立的、可测试的阶段。

### 实施步骤

1. **规划阶段**
   ```
   Phase 1: 提取工具（低风险）
   Phase 2: 单例模式（低风险）
   Phase 3: 辅助函数（低-中风险）
   Phase 4: 脚本生成（中风险）- 延期
   Phase 5: 拆分主窗口（中-高风险）- 延期
   Phase 6: 性能优化（中风险）- 延期
   Phase 7: 代码质量（低风险）
   ```

2. **每阶段独立提交**
   ```bash
   git commit -m "Phase 1: Extract utilities from common.jsx"
   git commit -m "Phase 2: Implement Platform singleton"
   git commit -m "Phase 3: Extract helper functions"
   ```

3. **每阶段测试**
   ```
   测试清单:
   - [ ] 面板加载无错误
   - [ ] 所有按钮功能正常
   - [ ] 渲染队列操作正常
   - [ ] 跨平台兼容性
   ```

4. **评估和调整**
   ```
   Phase 3 完成后评估:
   - 已实现显著改进
   - Phase 4-6 风险较高
   - 决策: 延期高风险阶段
   ```

### 结果
- 3 个阶段成功完成
- 3 个阶段战略性延期
- 零回归错误
- 清晰的回滚点

### 何时使用
- 大型重构项目
- 需要保持系统稳定
- 团队需要渐进式改进

## 模式 5: 常量提取模式

### 问题
魔法数字和字符串分散在代码中。

### 解决方案
提取所有常量到专用模块。

### 实施步骤

1. **识别魔法数字**
   ```javascript
   // 发现的魔法数字:
   if (padding === 5) { ... }
   if (length > 100) { ... }
   rqItem.setSetting('Time Span', 0);
   rqItem.setSetting('Quality', 2);
   ```

2. **创建常量模块**
   ```javascript
   /**
    * @module constants
    * @description 全局常量
    * @dependencies 无
    */

   // 填充常量
   var PADDING_5_DIGITS = 5;
   var PADDING_4_DIGITS = 4;

   // 字符串长度常量
   var DEFAULT_ELLIPSIS_LENGTH = 100;

   // 渲染队列常量
   var TIME_SPAN_COMP_LENGTH = 0;
   var QUALITY_BEST = 2;
   ```

3. **替换魔法数字**
   ```javascript
   // ❌ 之前
   if (padding === 5) { ... }
   rqItem.setSetting('Time Span', 0);

   // ✅ 之后
   if (padding === PADDING_5_DIGITS) { ... }
   rqItem.setSetting('Time Span', TIME_SPAN_COMP_LENGTH);
   ```

### 结果
- 所有魔法数字消除
- 代码自文档化
- 易于修改值

### 何时使用
- 代码中有魔法数字
- 值可能需要调整
- 需要提高可读性

## 反模式: 避免的做法

### 反模式 1: 过度工程化

**问题:**
```javascript
// ❌ 为单次使用创建抽象
function createButtonWithErrorHandling(name, icon, handler) {
  var button = group.add('iconbutton', undefined, icon);
  button.onClick = function() {
    try {
      handler();
    } catch (e) {
      catchError(e);
    }
  };
  return button;
}

// 只使用一次
var myButton = createButtonWithErrorHandling('myButton', icon, handler);
```

**为什么不好:** 为一次性操作增加不必要的复杂性

**替代方案:** 只在模式重复 3+ 次时提取

### 反模式 2: 破坏封装

**问题:**
```javascript
// ❌ 辅助函数访问内部状态
function getInternalState() {
  return cls.prototype._privateData;  // 访问私有数据
}
```

**为什么不好:** 破坏模块边界

**替代方案:** 通过公共 API 访问

### 反模式 3: 过早拆分

**问题:**
```javascript
// ❌ 将 100 行文件拆分为 10 个文件
// button1.jsx (10 lines)
// button2.jsx (10 lines)
// ...
```

**为什么不好:** 增加复杂性而无明显收益

**替代方案:** 只在文件 >500 行时拆分

## 重构清单

在开始重构前检查:

- [ ] 识别了具体问题（重复、大小、耦合）
- [ ] 选择了适当的模式
- [ ] 规划了阶段性方法
- [ ] 准备了测试策略
- [ ] 有回滚计划
- [ ] 团队/用户知晓变更

在完成重构后检查:

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档已更新
- [ ] 提交消息清晰
- [ ] 向后兼容性保持
- [ ] 性能未退化

## 相关规范

- [模块化架构](./module-architecture.md) - 模块结构和契约
- [编码约定](./coding-conventions.md) - 代码风格指南
- [测试策略](./testing-strategy.md) - 测试方法
