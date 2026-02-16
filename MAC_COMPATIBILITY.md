# Mac Compatibility Implementation

## Overview

RenderQueue+ has been updated to support both Windows and Mac OS platforms. This document describes the changes made to enable cross-platform compatibility.

## Changes Made

### 1. Platform Abstraction Layer (`platform.jsx`)

A new platform abstraction module was created to handle platform-specific operations:

- **Platform Detection**: Automatically detects Windows vs Mac
- **Path Separators**: Handles backslash (Windows) vs forward slash (Mac)
- **Executable Extensions**: Manages `.exe` extension on Windows, no extension on Mac
- **Font Paths**: Provides platform-specific font locations for FFmpeg
- **Command Generation**: Creates appropriate shell commands for each platform
- **Script Generation**: Generates `.bat` files on Windows, `.sh` files on Mac
- **Process Management**: Handles `tasklist`/`taskkill` on Windows, `ps`/`kill` on Mac

### 2. Core Module Updates

#### `main.jsx`
- Removed Windows-only platform check
- Added platform module inclusion
- Now initializes on both Windows and Mac

#### `ffmpeg.jsx`
- Updated to use platform-specific font paths
- Removed Windows-only check in `callSystem()`
- Uses platform abstraction for shell command prefix

#### `directory.jsx`
- Added Mac support for directory listing using `ls` command
- Parses both Windows `dir` and Mac `ls -l` output formats
- Handles platform-specific error messages

#### `taskmanager.jsx`
- Uses platform-specific process listing commands
- Parses both `tasklist` (Windows) and `ps aux` (Mac) output
- Implements cross-platform process killing

#### `mainwindow.jsx`
- Generates `.bat` files on Windows, `.sh` files on Mac
- Sets execute permissions on shell scripts (Mac only)
- Uses platform-specific file opening commands (`start` vs `open`)
- Handles background process launching for both platforms

#### `settings.jsx`
- Updated file dialogs to accept platform-appropriate executables
- Implements platform-specific aerender path detection
- Removes `.exe` extension requirement on Mac

## Platform-Specific Differences

### Windows
- Uses batch files (`.bat`)
- Commands: `cmd /c`, `dir`, `tasklist`, `taskkill`, `start`
- Executables: `aerender.exe`, `ffmpeg.exe`, `rv.exe`
- Font path: `/Windows/Fonts/Arial.ttf`

### Mac
- Uses shell scripts (`.sh`)
- Commands: `sh -c`, `ls`, `ps`, `kill`, `open`
- Executables: `aerender`, `ffmpeg`, `rv` (no extension)
- Font paths: `/Library/Fonts/Arial.ttf` or `/System/Library/Fonts/Supplemental/Arial.ttf`
- Requires `chmod +x` for script execution

## Known Limitations

### Mac-Specific Considerations

1. **Aerender Location**: On Mac, `aerender` is inside the After Effects application bundle at:
   ```
   /Applications/Adobe After Effects [Version]/Adobe After Effects [Version].app/Contents/MacOS/aerender
   ```
   The script now attempts to:
   - Auto-detect from the current After Effects installation using `app.path`
   - Search common installation paths (2019-2025)
   - Prompt for manual selection if not found

2. **Shell Script Permissions**: Shell scripts require execute permissions. The platform module automatically sets these using `chmod +x`.

3. **Font Availability**: Arial.ttf may be in different locations on Mac. The platform module checks multiple common locations.

4. **FFmpeg Installation**: On Mac, FFmpeg is typically installed via Homebrew:
   ```bash
   brew install ffmpeg
   ```
   Default location: `/usr/local/bin/ffmpeg` or `/opt/homebrew/bin/ffmpeg`

5. **Process Detection**: The Mac version uses `ps aux` to detect aerender processes. The regex pattern matches both `aerender` and `After Effects` processes.

## Testing Recommendations

### Windows Testing
- Verify all existing features still work
- Test background rendering with batch files
- Test FFmpeg integration
- Test process management (listing and killing aerender processes)

### Mac Testing
- Test background rendering with shell scripts
- Verify shell script execution permissions
- Test FFmpeg with Mac font paths
- Test process listing and termination
- Test executable path detection for aerender
- Verify file system operations (directory listing)

## Future Improvements

1. **Enhanced Aerender Detection**: Implement more robust version-agnostic detection for After Effects on Mac
2. **Homebrew Integration**: Auto-detect FFmpeg installed via Homebrew
3. **Error Handling**: Improve error messages for platform-specific issues
4. **Path Handling**: Further normalize path handling across platforms
5. **Testing**: Create automated tests for both platforms

## Migration Notes

For users migrating from Windows-only version:

1. **No Breaking Changes**: All Windows functionality remains unchanged
2. **Settings Preserved**: Existing Windows settings will continue to work
3. **New Platform Support**: Mac users can now use all features

For new Mac users:

1. **Initial Setup**: You'll need to manually locate aerender on first run
2. **FFmpeg Setup**: Install FFmpeg via Homebrew or manually
3. **RV Player**: If using RV, specify the path to the RV executable

## Technical Details

### Script Execution

**Windows:**
```batch
@echo off
start "Title" cmd /c "command"
exit /b
```

**Mac:**
```bash
#!/bin/bash
# Title
command &
```

### Process Management

**Windows:**
```batch
tasklist
taskkill /f /t /pid [PID]
```

**Mac:**
```bash
ps aux
kill -9 [PID]
```

### Directory Listing

**Windows:**
```batch
dir "path" /o:n /a:-d-h
```

**Mac:**
```bash
ls -l | grep "^-"
```

## Support

For issues specific to Mac compatibility, please include:
- Mac OS version
- After Effects version
- Error messages or unexpected behavior
- Whether aerender was auto-detected or manually selected

## Credits

Original Windows-only version by Gergely Wootsch
Mac compatibility implementation: 2026
