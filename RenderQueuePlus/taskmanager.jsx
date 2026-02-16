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


var Taskmanager = function() {
  var platform = getPlatform();
  var re1 = platform.isWindows ? /(.*aerender.exe.*)/gim : /(.*aerender.*)/gim;
  var re2 = /(.*afterfx.com.*)/gim;

  var cls = function() {
    this.data = function() {
        try {
            // WORKAROUND: On Mac with AE 2025, system.callSystem can cause hangs
            // Skip process checking on Mac to avoid this issue
            if (platform.isMac) {
                $.writeln('RenderQueue+: Skipping process check on Mac (known issue with AE 2025)');
                return '';
            }

            var cmd = platform.getProcessListCommand();
            $.writeln('RenderQueue+: Executing process list command: ' + cmd);

            var data = system.callSystem(cmd);
            $.writeln('RenderQueue+: Process list retrieved, length: ' + data.length);

            if (data && data.length > 0) {
                return data;
            }
        } catch (e) {
            $.writeln('RenderQueue+: Failed to get process list: ' + e.toString());
            // Return empty string to continue without process checking
        }
        return '';
    }();
    this.status = false;
  };

  cls.prototype = {
    isActive: function() {
      if (re1.test(this.data) || re2.test(this.data)) {
        this.status = true;
      } else if (!(re1.test(this.data)) && !(re2.test(this.data))) {
        this.status = false;
      }
      return this.status;
    },

    getNames: function() {
      var names = [];
      var items;
      var item;
      var i = 0;

      if (re1.test(this.data)) {
        items = this.data.match(re1);
        for (i = 0; i < items.length; i++) {
          item = items[i];
          item = item.replace(/\s+/gi, ',');
          var parts = item.split(',');
          names.push(platform.isWindows ? parts[0] : 'aerender');
        }
      } else if (re2.test(this.data)) {
        items = this.data.match(re2);
        for (i = 0; i < items.length; i++) {
          item = items[i];
          item = item.replace(/\s+/gi, ',');
          var parts = item.split(',');
          names.push(platform.isWindows ? parts[0] : 'afterfx.com');
        }
      }
      return names;
    },

    getPIDs: function() {
      var PIDs = [];
      var items;
      var item;
      var i = 0;

      if (re1.test(this.data)) {
        items = this.data.match(re1);
        for (i = 0; i < items.length; i++) {
          item = items[i];
          item = item.replace(/\s+/gi, ',');
          var parts = item.split(',');
          PIDs.push(platform.isWindows ? parts[1] : parts[1]);
        }
      } else if (re2.test(this.data)) {
        items = this.data.match(re2);
        for (i = 0; i < items.length; i++) {
          item = items[i];
          item = item.replace(/\s+/gi, ',');
          var parts = item.split(',');
          PIDs.push(platform.isWindows ? parts[1] : parts[1]);
        }
      }
      return PIDs;
    },

    validate: function(PID) {
        var cmd = platform.getProcessValidateCommand(PID);
        var call = system.callSystem(cmd);

        if (re1.test(call)) {
            return true;
        } else if (re2.test(call)) {
            return true;
        } else {
            return false;
        }
    },

    kill: function(PID) {
        var cmd = platform.getKillCommand(PID);
        if (this.validate(PID)) {
            var call = system.callSystem(cmd);
            return call;
        }
    },
  };
  return cls;
}();
