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
 * @module stringutils
 * @description String manipulation utilities
 * @dependencies constants.jsx
 */

/**
 * After Effects helper script: returns the number of leading zeros
 * @param  {string} n string to extrapolate the padding from
 * @return {integer}   the number of leading zeros
 */
function getPadding(n) {
  var e = decodeURI(n).match(
    /\[[#]+\]/g
  );
  return e ? e[0].length - 2 : null;
}

/**
 * Returns the number of digits of a number found
 * in the given string.
 * @param  {String} inString String to examine
 * @return {Number}          the number of digits
 */
function getPaddingFromName(inString) {
  var re1 = /\d{5}\.[a-zA-Z]+$/ig;
  var re2 = /\d{4}\.[a-zA-Z]+$/ig;
  var re3 = /\d{3}\.[a-zA-Z]+$/ig;
  var re4 = /\d{2}\.[a-zA-Z]+$/ig;
  if (re1.test(inString)) {
    return PADDING_5_DIGITS;
  } else if (re2.test(inString)) {
    return PADDING_4_DIGITS;
  } else if (re3.test(inString)) {
    return PADDING_3_DIGITS;
  } else if (re4.test(inString)) {
    return PADDING_2_DIGITS;
  } else {
    return null;
  }
}

/**
 * Returns the frame number
 * @param  {String} inString a path to a file.
 * @return {String}         the frame number as a string with padding included.
 */
function getFrameNumberFromName(inString) {
  var re1 = /\d{5}\.[a-zA-Z]+$/ig;
  var re2 = /\d{4}\.[a-zA-Z]+$/ig;
  var re3 = /\d{3}\.[a-zA-Z]+$/ig;
  var re4 = /\d{2}\.[a-zA-Z]+$/ig;

  var re;

  if (re1.test(inString)) {
    re = re1;
  } else if (re2.test(inString)) {
    re = re2;
  } else if (re3.test(inString)) {
    re = re3;
  } else if (re4.test(inString)) {
    re = re4;
  } else {
    return null;
  }

  return inString.match(re)[0].split('.')[0];
}

/**
 * Return the version number from the given string
 * eg 'v001'
 * @param  {string} inString string containing the version
 * @return {number}          the version number
 */
function getVersionNumberFromString(inString) {
  var match = inString.match(/(v\d\d\d)/ig);
  if (match) {
    return parseInt(match[0].slice(1), 10);
  }
  return null;
}

/**
 * Adds n number of leading zeros to a given number
 * @param  {integer} a the number to pad
 * @param  {integer} b number of leading zeros
 * @return {string}   the padded number
 */
function pad(a, b) {
  for (var c = a + ''; c.length < b;) c = '0' + c;
  return c;
}

/**
 * Clips the given string to the specified length:
 * '...clipped text'
 * @param  {string}  inString the text to clip
 * @param  {number}  length   clip the string to this length
 * @return {string}          the clipped text
 */
function ellipsis(inString, length) {
  if (!(length)) {
    var length = DEFAULT_ELLIPSIS_LENGTH;
  }

  if (inString) {
    if (inString.length > length) {
      var head = inString.substr(0, 0);
      var dots = '...';
      var tail = inString.substr(inString.length - length, inString.length);
      return head + dots + tail;
    }
    return inString;
  } else {
    return '-';
  }
}

/**
 * Clips the given string to the specified length.
 * 'The clipped (...) text'
 * @param  {string}  inString the text to clip
 * @param  {number}  length   clip the string to this length
 * @return {string}          the clipped text
 */
function ellipsis2(inString, length) {
  if (!(length)) {
    var length = DEFAULT_ELLIPSIS2_LENGTH;
  }
  if (inString) {
    if (inString.length > length) {
      var head = inString.substr(0, Math.round(length / 2));
      var dots = ' ... ';
      var tail = inString.substr(inString.length - Math.round(length / 2), inString.length);
      return head + dots + tail;
    }
    return inString;
  } else {
    return '-';
  }
}

/**
 * Returns a filename safe string
 * @param  {string} str input string
 * @return {string}     filename safe string
 */
function fileNameSafeString(str) {
  return str
    .replace(/([^a-z0-9]+)/gi, '_')
    .replace(/-{1,}/gi, '_')
    .replace(/_{1,}/gi, '_')
    .toLowerCase();
}
