# ExtendScript 代码规范索引

本项目是 Adobe After Effects ExtendScript 面板应用，不是标准的 Web 前端/后端项目。

## 规范文档

### 核心规范
- [模块化架构](./module-architecture.md) - 模块结构、依赖关系、加载顺序
- [编码约定](./coding-conventions.md) - 命名规范、代码风格、最佳实践
- [重构模式](./refactoring-patterns.md) - 已验证的重构策略和模式

### 平台特定
- [跨平台开发](./cross-platform.md) - Windows/Mac 差异处理
- [ExtendScript 限制](./extendscript-constraints.md) - 语言限制和解决方案

### 质量保证
- [测试策略](./testing-strategy.md) - 手动测试清单和验证流程
- [常见错误](./common-mistakes.md) - 已知陷阱和解决方案

## 项目背景

**技术栈:**
- Adobe ExtendScript (ES3/ES5)
- ScriptUI (用户界面)
- 跨平台 shell 脚本集成

**关键约束:**
- 全局命名空间（无模块系统）
- 必须使用 @include 指令
- 加载顺序至关重要
- 仅支持 ES3/ES5 语法
- 需要 polyfills

**架构模式:**
- 工具模块优先加载
- 单例模式用于共享资源
- 辅助函数减少重复
- 平台检测和条件执行

## 最近更新

- 2024-02: 完成模块化重构，创建 6 个工具模块
- 2024-02: 实现平台单例模式
- 2024-02: 添加辅助函数模式
