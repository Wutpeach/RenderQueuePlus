/*
MIT License

Copyright (c) 2018 Gergely Wootsch
hello@gergely-wootsch.com
http://gergely-wotsch.com

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
*/


/**
 * Platform abstraction layer for cross-platform compatibility
 * Provides platform-specific constants and helper functions
 */
var Platform = function() {
  var cls = function() {
    this.isWindows = (File.fs === 'Windows');
    this.isMac = (File.fs === 'Macintosh');

    // Platform-specific path separator
    this.pathSeparator = this.isWindows ? '\\' : '/';

    // Platform-specific executable extension
    this.exeExtension = this.isWindows ? '.exe' : '';

    // Platform-specific font paths
    this.fontPaths = this.isWindows ?
      ['/Windows/Fonts/Arial.ttf'] :
      ['/Library/Fonts/Arial.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf'];
  };

  cls.prototype = {
    /**
     * Get the appropriate font path for the current platform
     * @return {string} Font path
     */
    getFontPath: function() {
      if (this.isWindows) {
        return this.fontPaths[0];
      }

      // On Mac, check which font path exists
      for (var i = 0; i < this.fontPaths.length; i++) {
        var fontFile = new File(this.fontPaths[i]);
        if (fontFile.exists) {
          return this.fontPaths[i];
        }
      }

      // Default to first path if none found
      return this.fontPaths[0];
    },

    /**
     * Get the shell command prefix for executing commands
     * @return {string} Shell command prefix
     */
    getShellPrefix: function() {
      return this.isWindows ? 'cmd /c ' : 'sh -c ';
    },

    /**
     * Get the script file extension for the current platform
     * @return {string} Script extension (.bat or .sh)
     */
    getScriptExtension: function() {
      return this.isWindows ? '.bat' : '.sh';
    },

    /**
     * Get the directory listing command for the current platform
     * @param {string} path Path to list
     * @param {string} args Platform-specific arguments
     * @return {string} Directory listing command
     */
    getDirCommand: function(path, args) {
      if (this.isWindows) {
        return 'dir "' + path + '" ' + args;
      } else {
        // Convert Windows dir args to Mac ls args
        var lsArgs = '';
        if (args.indexOf('/o:n') >= 0) {
          // Sort by name (default for ls)
          lsArgs += '';
        }
        if (args.indexOf('/a:-d-h') >= 0) {
          // Files only, no directories, no hidden
          lsArgs += '-p | grep -v /';
        } else if (args.indexOf('/a:d-h') >= 0) {
          // Directories only, no hidden
          lsArgs += '-d */';
        } else if (args.indexOf('/a:h-d') >= 0) {
          // Hidden files only
          lsArgs += '-a | grep "^\\..*[^/]$"';
        } else if (args.indexOf('/a:hd') >= 0) {
          // Hidden directories only
          lsArgs += '-ad .*/';
        } else if (args.indexOf('/a:h') >= 0) {
          // All hidden
          lsArgs += '-a | grep "^\\."';
        }

        return 'ls -l ' + lsArgs + ' "' + path + '"';
      }
    },

    /**
     * Get the process list command for the current platform
     * @return {string} Process list command
     */
    getProcessListCommand: function() {
      return this.isWindows ? 'tasklist' : 'ps aux';
    },

    /**
     * Get the process kill command for the current platform
     * @param {string} pid Process ID
     * @return {string} Kill command
     */
    getKillCommand: function(pid) {
      return this.isWindows ?
        'taskkill /f /t /pid ' + pid :
        'kill -9 ' + pid;
    },

    /**
     * Get the process validation command for the current platform
     * @param {string} pid Process ID
     * @return {string} Validation command
     */
    getProcessValidateCommand: function(pid) {
      return this.isWindows ?
        'tasklist /fi "pid eq ' + pid + '"' :
        'ps -p ' + pid;
    },

    /**
     * Get the aerender executable name for the current platform
     * @return {string} Aerender executable name
     */
    getAerenderName: function() {
      return 'aerender' + this.exeExtension;
    },

    /**
     * Get the default aerender path for the current platform
     * @return {string} Default aerender path
     */
    getDefaultAerenderPath: function() {
      if (this.isWindows) {
        return File.decode(Folder.startup.absoluteURI + '/aerender.exe');
      } else {
        // On Mac, aerender is inside the After Effects app bundle
        // Path format: /Applications/Adobe After Effects [Version]/Adobe After Effects [Version].app/Contents/MacOS/aerender

        // First, try to get the path from the current After Effects installation
        try {
          var appPath = app.path;
          if (appPath) {
            // app.path gives us the .app bundle path
            var aerenderPath = appPath + '/Contents/MacOS/aerender';
            var aerenderFile = new File(aerenderPath);
            if (aerenderFile.exists) {
              return aerenderPath;
            }
          }
        } catch (e) {
          // Continue to try other methods
        }

        // Try common installation paths with proper .app bundle structure
        var commonVersions = [
          'Adobe After Effects 2025',
          'Adobe After Effects 2024',
          'Adobe After Effects 2023',
          'Adobe After Effects 2022',
          'Adobe After Effects 2021',
          'Adobe After Effects CC 2020',
          'Adobe After Effects CC 2019'
        ];

        for (var i = 0; i < commonVersions.length; i++) {
          var version = commonVersions[i];
          var appBundlePath = '/Applications/' + version + '/' + version + '.app/Contents/MacOS/aerender';
          var aerenderFile = new File(appBundlePath);
          if (aerenderFile.exists) {
            return appBundlePath;
          }
        }

        // If not found, return a generic path (will prompt user to select)
        return '/Applications/Adobe After Effects 2024/Adobe After Effects 2024.app/Contents/MacOS/aerender';
      }
    },

    /**
     * Create a background render script for the current platform
     * @param {string} scriptPath Path where script will be saved
     * @param {string} title Window/process title
     * @param {string} command Command to execute
     * @return {string} Script content
     */
    createRenderScript: function(scriptPath, title, command) {
      if (this.isWindows) {
        return 'start "' + title + '" cmd /c "' + command + '"';
      } else {
        // Mac shell script
        var script = '#!/bin/bash\n';
        script += '# ' + title + '\n';
        script += command + ' &\n';
        return script;
      }
    },

    /**
     * Create a simple execution script for the current platform
     * @param {string} command Command to execute
     * @return {string} Script content
     */
    createExecutionScript: function(command) {
      if (this.isWindows) {
        return '@echo off\nstart "" ' + command + '\nexit /b';
      } else {
        return '#!/bin/bash\n' + command + ' &';
      }
    },

    /**
     * Set execute permissions on a file (Mac only)
     * @param {File} file File object
     */
    setExecutePermissions: function(file) {
      if (this.isMac && file.exists) {
        try {
          system.callSystem('chmod +x "' + file.fsName + '"');
        } catch (e) {
          // Silently fail if chmod doesn't work
        }
      }
    },

    /**
     * Parse process list output for aerender processes
     * @param {string} output Process list output
     * @return {Array} Array of process info objects
     */
    parseProcessList: function(output) {
      var processes = [];

      if (this.isWindows) {
        // Windows tasklist format
        var re1 = /(.*aerender.exe.*)/gim;
        var re2 = /(.*afterfx.com.*)/gim;

        var matches = output.match(re1) || output.match(re2);
        if (matches) {
          for (var i = 0; i < matches.length; i++) {
            var item = matches[i].replace(/\s+/gi, ',');
            var parts = item.split(',');
            processes.push({
              name: parts[0],
              pid: parts[1]
            });
          }
        }
      } else {
        // Mac ps aux format
        var lines = output.split('\n');
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf('aerender') >= 0 || lines[i].indexOf('After Effects') >= 0) {
            var parts = lines[i].replace(/\s+/g, ' ').split(' ');
            if (parts.length >= 2) {
              processes.push({
                name: 'aerender',
                pid: parts[1]
              });
            }
          }
        }
      }

      return processes;
    }
  };

  return cls;
}();
