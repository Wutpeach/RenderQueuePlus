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
 * @module errorhandler
 * @description Error handling utilities
 * @dependencies constants.jsx, stringutils.jsx
 */

/**
 * Displays a popup dialog with editable text contents
 * @param  {string} title Title of the dialog
 * @param  {string} input Dialog contents
 */
function alertScroll(title, input) {
  var w = new Window('dialog', title);
  var list = w.add('edittext', undefined, input, {
    multiline: true,
    scrolling: true,
  });
  w.add('button', undefined, 'Close', {
    name: 'ok',
  });
  list.size = [ALERT_SCROLL_WIDTH, ALERT_SCROLL_HEIGHT];
  w.show();
}

/**
 * Custom error catcher.
 * @param  {Error} e error object
 */
function catchError(e) {
  var prop;

  var number;
  var filename;
  var line;
  var source;
  var start;
  var end;
  var message;
  var name;
  var description;

  var MESSAGE = '';

  for (prop in e) {
    if (prop == 'number') {
      number = parseInt(e[prop]);
    } else if (prop == 'fileName') {
      filename = new File(e[prop]).absoluteURI;
    } else if (prop == 'line') {
      line = parseInt(e[prop]);
    } else if (prop == 'source') {
      source = e[prop];
      source = source.trim();
      source = source.split('\n');
      var ln = '';
      for (var i = 0; i < source.length; i++) {
        ln += String(pad(i + 1, LINE_NUMBER_PADDING)) + '  ' + String(source[i]) + '\n';
      }
      source = ln;
    } else if (prop == 'start') {
      start = e[prop];
    } else if (prop == 'end') {
      end = e[prop];
    } else if (prop == 'message') {
      message = e[prop];
    } else if (prop == 'name') {
      name = e[prop];
    } else if (prop == 'description') {
      description = e[prop];
    }
  }
  MESSAGE = String(
    'Error:\n\n' +
    '---------------------------------\n\n' +
    '"' + message + '"\n\n' +
    '---------------------------------\n\n' +
    'Line number: ' + line + '\n' +
    'File: ' + filename + '\n\n' +
    'Source:\n\n' + source
  );
  alertScroll(SCRIPT_NAME, MESSAGE);
}
