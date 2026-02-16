# RenderQueue+ Mac 设置指南

## 首次运行设置

### 1. Aerender 路径设置

当你首次运行脚本时，如果看到 "Aerender could not be located" 提示，这是正常的。

#### 自动检测失败的原因
- After Effects 安装在非标准位置
- 使用的是较旧或较新的版本
- 应用程序包结构不同

#### 手动选择 Aerender

点击 "Yes" 后，需要导航到正确的位置：

**标准路径格式：**
```
/Applications/Adobe After Effects [版本]/Adobe After Effects [版本].app/Contents/MacOS/aerender
```

**具体示例：**
- After Effects 2024: `/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender`
- After Effects 2023: `/Applications/Adobe After Effects 2023/Adobe After Effects 2023.app/Contents/MacOS/aerender`
- After Effects 2022: `/Applications/Adobe After Effects 2022/Adobe After Effects 2022.app/Contents/MacOS/aerender`

#### 如何找到 Aerender

**方法 1：使用 Finder**
1. 打开 Finder
2. 按 `Cmd + Shift + G` (前往文件夹)
3. 输入：`/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/`
4. 选择 `aerender` 文件

**方法 2：使用终端**
```bash
# 查找所有 aerender 位置
find /Applications -name aerender 2>/dev/null

# 验证路径是否存在
ls -la "/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender"
```

**方法 3：从 After Effects 应用程序**
1. 在 Finder 中找到 After Effects 应用程序
2. 右键点击应用程序图标
3. 选择 "显示包内容"
4. 导航到 `Contents/MacOS/`
5. 找到 `aerender` 文件

### 2. FFmpeg 设置（可选）

如果要使用 FFmpeg 功能将图像序列转换为视频：

#### 安装 FFmpeg

**使用 Homebrew（推荐）：**
```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 FFmpeg
brew install ffmpeg
```

#### 设置 FFmpeg 路径

在 RenderQueue+ 设置中：
- Homebrew (Intel Mac): `/usr/local/bin/ffmpeg`
- Homebrew (Apple Silicon): `/opt/homebrew/bin/ffmpeg`

**查找 FFmpeg 位置：**
```bash
which ffmpeg
```

### 3. RV Player 设置（可选）

如果使用 RV 播放器查看渲染输出：

1. 下载并安装 RV Player
2. 在 RenderQueue+ 设置中指定 RV 可执行文件路径
3. 通常位于：`/Applications/RV.app/Contents/MacOS/RV`

## 常见问题

### Q: 为什么脚本找不到 aerender？
**A:** Mac 上的 aerender 位于应用程序包内部（.app/Contents/MacOS/），不在应用程序文件夹的根目录。脚本现在会尝试自动检测，但如果失败，需要手动选择。

### Q: 如何验证 aerender 路径是否正确？
**A:** 在终端运行：
```bash
"/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender" -version
```
如果路径正确，会显示 After Effects 版本信息。

### Q: 脚本生成的 .sh 文件无法执行？
**A:** 脚本会自动设置执行权限，但如果遇到问题，可以手动设置：
```bash
chmod +x /path/to/script.sh
```

### Q: FFmpeg 找不到字体文件？
**A:** 脚本会自动检测以下位置：
- `/Library/Fonts/Arial.ttf`
- `/System/Library/Fonts/Supplemental/Arial.ttf`

如果都不存在，可以：
1. 安装 Arial 字体
2. 或在 FFmpeg 设置中指定其他字体

### Q: 后台渲染不工作？
**A:** 检查：
1. Aerender 路径是否正确
2. 项目文件是否已保存
3. 输出路径是否有写入权限
4. 查看生成的 .sh 脚本是否有执行权限

## 权限问题

如果遇到权限错误：

```bash
# 给予脚本执行权限
chmod +x /path/to/script.sh

# 给予输出文件夹写入权限
chmod -R 755 /path/to/output/folder
```

## 调试技巧

### 查看生成的脚本
脚本文件保存在临时目录：
```bash
# 查看临时文件
ls -la ~/Library/Caches/TemporaryItems/
```

### 手动测试 Aerender
```bash
# 测试 aerender 是否工作
"/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender" \
  -project "/path/to/project.aep" \
  -rqindex 1 \
  -output "/path/to/output.mov"
```

### 检查进程
```bash
# 查看正在运行的 aerender 进程
ps aux | grep aerender

# 终止 aerender 进程
killall aerender
```

## 性能优化

### 后台渲染
Mac 上的后台渲染使用 shell 脚本和 `&` 符号：
```bash
#!/bin/bash
aerender -project "..." &
```

### 多个渲染任务
可以同时运行多个 aerender 实例，但要注意：
- CPU 和内存使用
- 磁盘 I/O 性能
- 许可证限制

## 支持

如果遇到问题：
1. 检查 After Effects 版本是否受支持
2. 验证所有路径设置是否正确
3. 查看控制台错误信息
4. 尝试手动运行 aerender 命令测试

## 版本兼容性

已测试的 After Effects 版本：
- After Effects 2025
- After Effects 2024
- After Effects 2023
- After Effects 2022
- After Effects 2021
- After Effects CC 2020
- After Effects CC 2019

如果使用其他版本，路径格式可能不同，需要手动指定。
