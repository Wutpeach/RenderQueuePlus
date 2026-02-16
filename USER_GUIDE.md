# RenderQueue+ 用户使用说明书

## 目录
1. [简介](#简介)
2. [系统要求](#系统要求)
3. [安装指南](#安装指南)
4. [首次设置](#首次设置)
5. [核心功能](#核心功能)
6. [使用教程](#使用教程)
7. [常见问题](#常见问题)
8. [故障排除](#故障排除)
9. [高级功能](#高级功能)

---

## 简介

RenderQueue+ 是一个强大的 After Effects 工作流工具，为渲染、审阅和管理输出提供便利。它添加了输出版本控制、后台渲染、相对输出路径、图像序列审阅和编辑等实用功能。

### 主要特性
- ✅ **版本控制** - 自动管理输出版本，轻松比较不同版本
- ✅ **后台渲染** - 在后台渲染，无需等待即可继续工作
- ✅ **相对路径** - 使用相对于项目的输出路径，便于项目移动
- ✅ **图像序列管理** - 查看、编辑和删除渲染的图像序列
- ✅ **FFmpeg 集成** - 自动将图像序列转换为视频文件
- ✅ **项目归档** - 自动保存用于渲染每个版本的项目副本
- ✅ **跨平台支持** - 完全支持 Windows 和 Mac OS

---

## 系统要求

### 支持的平台
- **Windows** - 完全支持
- **Mac OS** - 完全支持（包括 Apple Silicon）

### 支持的 After Effects 版本
- After Effects 2025 ✅
- After Effects 2024 ✅
- After Effects 2023 ✅
- After Effects 2022 ✅
- After Effects 2021 ✅
- After Effects CC 2020 ✅
- After Effects CC 2019 ✅

### 可选依赖
- **FFmpeg** - 用于将图像序列转换为视频（可选）
- **RV Player** - 用于审阅渲染输出（可选）

---

## 安装指南

### Windows 安装

1. **下载文件**
   - 下载 `RenderQueue+.jsx` 文件
   - 下载 `RenderQueuePlus` 文件夹

2. **安装到 After Effects**

   将两个文件放入 ScriptUI Panels 文件夹：
   ```
   C:\Program Files\Adobe\Adobe After Effects [版本]\Support Files\Scripts\ScriptUI Panels\
   ```

   安装后的结构：
   ```
   ScriptUI Panels\
   ├── RenderQueue+.jsx
   └── RenderQueuePlus\
       ├── main.jsx
       ├── platform.jsx
       └── ... (其他文件)
   ```

3. **重启 After Effects**

4. **打开面板**

   在 After Effects 中：`Window > RenderQueue+.jsx`

### Mac OS 安装

1. **下载文件**
   - 下载 `RenderQueue+.jsx` 文件
   - 下载 `RenderQueuePlus` 文件夹

2. **安装到 After Effects**

   将两个文件放入 ScriptUI Panels 文件夹：
   ```
   /Applications/Adobe After Effects [版本]/Scripts/ScriptUI Panels/
   ```

   安装后的结构：
   ```
   ScriptUI Panels/
   ├── RenderQueue+.jsx
   └── RenderQueuePlus/
       ├── main.jsx
       ├── platform.jsx
       └── ... (其他文件)
   ```

3. **重启 After Effects**

4. **打开面板**

   在 After Effects 中：`Window > RenderQueue+.jsx`

---

## 首次设置

### 1. 启用脚本权限

首次运行时，需要启用脚本文件写入权限：

1. 打开 After Effects
2. 进入 `Edit > Preferences > Scripting & Expressions`
3. 勾选 `Allow Scripts to Write Files and Access Network`
4. 重启 After Effects

### 2. 关闭脚本执行警告（可选）

为了避免每次渲染时弹出警告：

1. 进入 `Edit > Preferences > Scripting & Expressions`
2. 取消勾选 `Warn User When Executing Files`
3. 重启 After Effects

### 3. 设置 Aerender 路径（Mac 用户）

**Mac 用户首次运行可能需要手动设置 aerender 路径：**

#### After Effects 2025
```
/Applications/Adobe After Effects 2025/aerender
```

#### After Effects 2024 及更早版本
```
/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender
```

**设置步骤：**
1. 打开 RenderQueue+ 面板
2. 点击 Settings（设置）按钮
3. 在 "Aerender Binary" 字段中输入或浏览到正确的路径
4. 点击 OK 保存

**快速查找方法：**
```bash
# 在终端运行
find /Applications -name aerender 2>/dev/null
```

### 4. 设置 FFmpeg（可选）

如果想要自动将图像序列转换为视频：

#### Mac 安装 FFmpeg
```bash
# 使用 Homebrew 安装
brew install ffmpeg

# 查找 FFmpeg 路径
which ffmpeg
```

常见路径：
- Intel Mac: `/usr/local/bin/ffmpeg`
- Apple Silicon: `/opt/homebrew/bin/ffmpeg`

#### Windows 安装 FFmpeg
1. 从 [ffmpeg.org](https://ffmpeg.org) 下载
2. 解压到一个固定位置（如 `C:\ffmpeg\`）
3. 在 RenderQueue+ 设置中指定 `ffmpeg.exe` 的完整路径

#### 在 RenderQueue+ 中设置
1. 打开 Settings
2. 找到 "FFmpeg Binary" 字段
3. 输入 FFmpeg 路径
4. 勾选 "Enable FFmpeg"
5. 点击 OK 保存

---

## 核心功能

### 1. 版本控制

RenderQueue+ 可以为输出模块启用版本控制，自动管理不同版本的渲染输出。

**版本命名格式：**
```
[合成名称]_v001
[合成名称]_v002
[合成名称]_v003
```

**功能：**
- 自动递增版本号
- 在版本之间切换
- 重置版本号
- 比较不同版本

### 2. 后台渲染

在后台渲染合成，无需等待渲染完成即可继续工作。

**工作原理：**
- 生成一个 shell 脚本（Mac: `.sh`, Windows: `.bat`）
- 脚本调用 `aerender` 在后台执行渲染
- 你可以继续在 After Effects 中工作

**注意：**
- 渲染时会打开一个终端窗口显示进度
- 可以同时运行多个渲染任务
- 关闭终端窗口会停止渲染

### 3. 相对输出路径

设置相对于项目文件的输出路径，便于项目移动和共享。

**示例：**
```
项目位置：/Users/username/Projects/MyProject/comps/project.aep
输出位置：/Users/username/Projects/MyProject/renders/

相对路径设置：././renders
```

### 4. 图像序列管理（Frame Manager）

查看、过滤和删除渲染的图像序列。

**功能：**
- 查看所有渲染的帧
- 按帧范围过滤（如 "1-20, 30-40"）
- 删除特定帧或帧范围
- 重新渲染缺失的帧

### 5. 项目归档

每次渲染时自动保存项目副本，确保可以追溯每个版本使用的项目文件。

**归档位置：**
```
[输出路径]/.aeparchive/[合成名称]/[版本]/
```

---

## 使用教程

### 基础工作流程

#### 步骤 1：准备项目

1. 在 After Effects 中创建或打开项目
2. 创建合成并添加到渲染队列
3. 设置输出模块（格式、编解码器等）
4. **保存项目**（必须！）

#### 步骤 2：在 RenderQueue+ 中设置版本控制

1. 打开 RenderQueue+ 面板（`Window > RenderQueue+.jsx`）
2. 在列表中选择要渲染的项目
3. 点击 "Versions" 下拉菜单
4. 选择 "Set Version Control"
5. 首次设置时，可能需要配置输出路径

#### 步骤 3：开始渲染

1. 确保项目已保存
2. 在 RenderQueue+ 中选择要渲染的项目
3. 点击 "Render" 按钮（▶️）
4. 终端窗口会打开并显示渲染进度
5. 继续在 After Effects 中工作或等待渲染完成

#### 步骤 4：查看输出

渲染完成后：
- 输出文件位于设置的输出路径中
- 如果启用了 FFmpeg，会自动生成视频文件
- 项目副本保存在 `.aeparchive` 文件夹中

### 高级工作流程

#### 版本管理

**递增版本：**
1. 选择项目
2. 点击 "Versions" 下拉菜单
3. 选择 "Increment Version"
4. 版本号自动增加（v001 → v002）

**切换版本：**
1. 点击 "Versions" 下拉菜单
2. 从列表中选择要切换到的版本
3. 输出路径自动更新

**重置版本：**
1. 点击 "Versions" 下拉菜单
2. 选择 "Reset Version"
3. 版本号重置为 v001

#### 重新渲染特定帧

1. 点击 "Frame Manager" 按钮
2. 在过滤框中输入帧范围（如 "10-20"）
3. 选择要删除的帧
4. 点击 "Delete Selected"
5. 关闭 Frame Manager
6. 再次点击 "Render" 按钮
7. 只有缺失的帧会被重新渲染

#### 批量渲染

1. 在 RenderQueue+ 中选择项目
2. 点击 "Batch" 按钮（而不是 "Render"）
3. 选择保存脚本文件的位置
4. 脚本文件可以：
   - 在其他计算机上运行
   - 在网络渲染农场上使用
   - 稍后执行

---

## 常见问题

### Q: 为什么点击渲染后没有反应？

**A:** 检查以下几点：
1. 项目是否已保存？（必须保存）
2. 是否在 RenderQueue+ 中选择了项目？
3. 是否设置了版本控制？
4. Aerender 路径是否正确？

### Q: 渲染时终端窗口显示错误怎么办？

**A:** 常见错误和解决方法：

**"aerender: command not found"**
- Aerender 路径设置不正确
- 在设置中重新指定正确的路径

**"Project file not found"**
- 项目文件路径包含特殊字符
- 尝试将项目保存到路径更简单的位置

**"Output directory not writable"**
- 输出目录没有写入权限
- 检查文件夹权限或选择其他输出位置

### Q: FFmpeg 不工作怎么办？

**A:** 检查：
1. FFmpeg 是否已安装？运行 `ffmpeg -version` 测试
2. FFmpeg 路径是否正确设置？
3. 是否勾选了 "Enable FFmpeg"？
4. 输出格式是否为图像序列？（FFmpeg 只处理序列）

### Q: 为什么渲染会打开终端窗口？

**A:** 这是设计行为，用于：
- 显示渲染进度
- 显示错误信息
- 允许后台渲染

如果不想看到窗口，可以最小化它。渲染完成后窗口会自动关闭。

### Q: 可以同时运行多个渲染任务吗？

**A:** 可以！但要注意：
- 每个任务会占用 CPU 和内存
- 可能会降低整体渲染速度
- 确保有足够的系统资源

### Q: 版本控制的文件保存在哪里？

**A:**
- 渲染输出：在你设置的输出路径中
- 项目归档：`[输出路径]/.aeparchive/[合成名称]/[版本]/`

---

## 故障排除

### Mac 特定问题

#### 问题：After Effects 2025 点击渲染后卡住

**原因：** AE 2025 的 `system.callSystem()` 在某些情况下会导致挂起。

**解决方案：** 已在最新版本中修复。确保使用最新版本的脚本。

#### 问题：找不到 aerender

**原因：** AE 2025 改变了 aerender 的位置。

**解决方案：**
```bash
# 查找 aerender
find /Applications -name aerender 2>/dev/null

# 手动设置路径
# AE 2025: /Applications/Adobe After Effects 2025/aerender
# AE 2024: /Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender
```

#### 问题：脚本执行警告

**解决方案：**
1. `Edit > Preferences > Scripting & Expressions`
2. 取消勾选 "Warn User When Executing Files"
3. 重启 After Effects

### Windows 特定问题

#### 问题：批处理文件无法执行

**解决方案：**
- 右键点击 `.bat` 文件
- 选择 "以管理员身份运行"
- 或检查文件路径是否包含特殊字符

#### 问题：FFmpeg 找不到

**解决方案：**
- 确保 FFmpeg 已添加到系统 PATH
- 或在设置中指定完整路径（如 `C:\ffmpeg\bin\ffmpeg.exe`）

### 通用问题

#### 问题：渲染输出为空

**检查：**
1. 合成是否有内容？
2. 输出模块设置是否正确？
3. 帧范围是否正确？
4. 输出路径是否有写入权限？

#### 问题：版本号不递增

**解决方案：**
- 手动点击 "Increment Version"
- 或检查输出路径设置是否正确

---

## 高级功能

### 自定义输出路径

使用相对路径语法：

```
././renders          # 项目同级的 renders 文件夹
../renders           # 项目上一级的 renders 文件夹
./output/final       # 项目文件夹内的 output/final
```

### FFmpeg 自定义选项

在设置中可以添加自定义 FFmpeg 参数：

**常用选项：**
```
-c:v libx264 -crf 18 -preset slow    # 高质量 H.264
-c:v prores_ks -profile:v 3           # ProRes 422 HQ
-c:v libx265 -crf 20                  # H.265/HEVC
```

### 网络渲染

使用批量渲染功能创建脚本，然后：

1. 将脚本复制到网络上的其他计算机
2. 确保项目文件和素材可访问（网络共享）
3. 在每台计算机上运行脚本
4. 多台计算机同时渲染不同的项目

### RV Player 集成

如果使用 Shotgun 的 RV Player：

1. 安装 RV Player
2. 在 RenderQueue+ 设置中指定 RV 路径
3. 渲染完成后，点击 "RV" 按钮查看输出

---

## 技巧和最佳实践

### 1. 合成命名

使用清晰、无特殊字符的合成名称：
- ✅ 好：`Scene01_Shot01`, `MainComp_v1`
- ❌ 避免：`Scene [1] (Shot 1)`, `Main Comp & Effects`

### 2. 项目组织

建议的项目结构：
```
MyProject/
├── comps/
│   └── project.aep
├── renders/
│   ├── Scene01_v001/
│   ├── Scene01_v002/
│   └── .aeparchive/
└── footage/
```

### 3. 版本管理策略

- 重大更改时递增版本
- 使用版本注释记录更改
- 定期清理旧版本

### 4. 性能优化

- 关闭不必要的预览
- 使用代理素材
- 渲染时关闭其他应用程序
- 考虑使用网络渲染

### 5. 备份

- 定期备份 `.aeparchive` 文件夹
- 保存重要版本的项目文件
- 使用版本控制系统（如 Git）管理项目

---

## 更新日志

### 2026 - Mac 兼容性更新
- ✅ 添加完整的 Mac OS 支持
- ✅ 跨平台脚本生成（Windows: .bat, Mac: .sh）
- ✅ 自动检测 aerender（支持两个平台）
- ✅ 平台特定的进程管理
- ✅ 跨平台目录操作
- ✅ FFmpeg 集成（支持两个平台）
- ✅ 修复 AE 2025 路径检测（aerender 位置变更）
- ✅ 修复 Mac 上的 system.callSystem 挂起问题
- ✅ 修复脚本文件名特殊字符问题
- ✅ 修复 Windows 换行符问题（CRLF → LF）

---

## 支持和联系

### 原作者
- **Gergely Wootsch**
- Email: hello@gergely-wootsch.com
- Website: http://gergely-wootsch.com/renderqueueplus

### Mac 兼容性
- 2026 年添加 - 完整的跨平台支持

### 获取帮助
- 查看 [MAC_SETUP_GUIDE.md](MAC_SETUP_GUIDE.md) 了解 Mac 特定设置
- 查看 [MAC_COMPATIBILITY.md](MAC_COMPATIBILITY.md) 了解技术实现细节
- 提交问题到项目的 GitHub 仓库

---

## 许可证

MIT License

Copyright (c) 2018 Gergely Wootsch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
