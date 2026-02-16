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
 * Wrapper module for cross-platform directory commands.
 */
var Directory = function(inPath) {
  var platform = new Platform();

  var cls = function(inPath) {
    var pathFile = new File(inPath);

    this.changePath = function(inPath) {
      pathFile.changePath(inPath);
    };

    this.all = function() {
      var args;
      if (platform.isWindows) {
        args = '/o:n';
      } else {
        args = '-la';
      }
      return this.callSystem(pathFile.fsName, args);
    };

    this.getFiles = function(mask) {
      var args;
      if (platform.isWindows) {
        args = '/o:n /a:-d-h';
        if (mask) {
          return this.callSystem(pathFile.fsName + '\\' + mask, args);
        } else {
          return this.callSystem(pathFile.fsName, args);
        }
      } else {
        args = '-files';
        if (mask) {
          return this.callSystem(pathFile.fsName + '/' + mask, args);
        } else {
          return this.callSystem(pathFile.fsName, args);
        }
      }
    };

    this.getFolders = function() {
      var args;
      if (platform.isWindows) {
        args = '/o:n /a:d-h';
      } else {
        args = '-dirs';
      }
      return this.callSystem(pathFile.fsName, args);
    };

    this.getHiddenFiles = function() {
      var args;
      if (platform.isWindows) {
        args = '/o:n /a:h-d';
      } else {
        args = '-hidden-files';
      }

      return this.callSystem(pathFile.fsName, args);
    };

    this.getHiddenFolders = function() {
      var args;
      if (platform.isWindows) {
        args = '/o:n /a:hd';
      } else {
        args = '-hidden-dirs';
      }
      return this.callSystem(pathFile.fsName, args);
    };

    this.getHidden = function() {
      var args;
      if (platform.isWindows) {
        args = '/o:n /a:h';
      } else {
        args = '-hidden';
      }
      return this.callSystem(pathFile.fsName, args);
    };
  };

  cls.prototype = {
    callSystem: function(inPath, args) {
      var re = /(?:\.([^.]+))?$/;
      var extension = re.exec(inPath)[1];

      var cmd;
      var stats = {};
      var error1;
      var error2;
      var error3;
      var error4;

      var tempOutput = new File(
        TEMP_DIR.absoluteURI + '/renderQueuePlus_dirOutput'
      );

      if (platform.isWindows) {
        cmd = 'cmd /c "' +
        'dir ' + '\"' + inPath + '\"' + ' ' + args + '>"' +
        tempOutput.fsName + '""';
      } else {
        // Mac: Use ls command with appropriate flags
        var lsCmd = 'ls -l';

        if (args === '-files') {
          lsCmd = 'ls -l | grep "^-"';
        } else if (args === '-dirs') {
          lsCmd = 'ls -ld */ 2>/dev/null';
        } else if (args === '-hidden-files') {
          lsCmd = 'ls -la | grep "^-" | grep "^\\."';
        } else if (args === '-hidden-dirs') {
          lsCmd = 'ls -lad .*/ 2>/dev/null';
        } else if (args === '-hidden') {
          lsCmd = 'ls -la | grep "^\\."';
        } else if (args === '-la') {
          lsCmd = 'ls -la';
        }

        cmd = 'cd "' + inPath + '" && ' + lsCmd + ' > "' + tempOutput.fsName + '"';
      }

      try {
        system.callSystem(cmd);
      } catch (e) {
        catchError(e);
      };

      try {
        tempOutput.open('r');
        var raw = tempOutput.read();
        tempOutput.close();

        if (platform.isWindows) {
          error1 = raw.indexOf('The system cannot find the file specified.');
          error2 = raw.indexOf(
            'Logon failure: unknown user name or bad password.'
          );
          error3 = raw.indexOf('The system cannot find the path specified.');
          error4 = raw.indexOf('File Not Found');
        } else {
          error1 = raw.indexOf('No such file or directory');
          error2 = raw.indexOf('Permission denied');
          error3 = raw.indexOf('cannot access');
          error4 = -1;
        }

        if ((error1 < 0) && (error2 < 0) && (error3 < 0) && (error4 < 0)) {
          if (platform.isWindows) {
            re = new RegExp('^.*(\.' + extension + ').*$', 'igm');
            raw = raw.match(re);

            var stats = {};
            var s;
            var d;
            var t;
            var z;
            var n;

            if (raw) {
              for (var i = 0; i < raw.length; i++) {
                s = raw[i].replace(/[,]/gim, '');
                s = s.match(/((\S+))/gim);

                d = String(s.shift());
                t = String(s.shift());
                z = parseInt(s.shift(), 10);
                n = String(s.join(' '));

                stats[n] = {
                  index: i,
                  date: d,
                  time: t,
                  size: z,
                  name: n,
                };
              }
              return stats;
            } else {
              stats['Error.'] = {
                index: 0,
                date: 'n/a',
                time: 'n/a',
                size: 'n/a',
                name: 'Error.',
              };
              return stats;
            }
          } else {
            // Mac: Parse ls -l output
            var lines = raw.split('\n');
            var stats = {};
            var index = 0;

            for (var i = 0; i < lines.length; i++) {
              var line = lines[i].trim();
              if (line === '' || line.indexOf('total ') === 0) {
                continue;
              }

              // Parse ls -l format: permissions links owner group size month day time/year name
              var parts = line.split(/\s+/);
              if (parts.length >= 9) {
                var name = parts.slice(8).join(' ');

                // Check if file matches extension
                if (extension && name.indexOf('.' + extension) < 0) {
                  continue;
                }

                var size = parseInt(parts[4], 10);
                var date = parts[5] + ' ' + parts[6];
                var time = parts[7];

                stats[name] = {
                  index: index++,
                  date: date,
                  time: time,
                  size: size,
                  name: name,
                };
              }
            }

            if (index > 0) {
              return stats;
            } else {
              stats['Error.'] = {
                index: 0,
                date: 'n/a',
                time: 'n/a',
                size: 'n/a',
                name: 'Error.',
              };
              return stats;
            }
          }
        } else {
          stats['Invalid path.'] = {
            index: 0,
            date: 'n/a',
            time: 'n/a',
            size: 'n/a',
            name: 'Invalid path.',
          };
          return stats;
        }
      } catch (e) {
        stats['Error.'] = {
          index: 0,
          date: 'n/a',
          time: 'n/a',
          size: 'n/a',
          name: 'Error.',
        };
        return stats;
      }
    },
  };
  return cls;
}();
