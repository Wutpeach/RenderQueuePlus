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
 * @module arrayutils
 * @description Array manipulation utilities
 * @dependencies None
 */

/**
 * Returns array of unique values.
 * @param  {Array} a input array
 * @return {Array}   array with unique values
 */
function uniq(a) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

/**
 * Converts a range to a dictionary of numbers
 * eg. '1-250' results in [1,2,3,..,250].
 * http://stackoverflow.com/questions/2270910/how-to-convert-sequence-of-numbers-in-an-array-to-range-of-numbers
 * @param  {string} string range string
 * @param  {string} limit maximum range limit
 * @return {object}       dictionary of numbers
 */
function getArrayFromRange(string, limit) {
  var d = {};

  var match;
  var start;
  var end;
  var duration;
  var idx;

  if (string.indexOf(',') > 0) {
    string = string.split(',');
    for (var i = 0; i < string.length; i++) {
      if (string[i].indexOf('-') > -1) {
        match = string[i].match(/(\d*)(-+)(\d*)/);

        if (!(match)) {
          continue;
        }

        start = parseInt(match[1], 10);
        end = parseInt(match[3], 10);

        if (start > end) {
          start = parseInt(match[3], 10);
          end = parseInt(match[1], 10);
        }

        duration = end - start;
        if (duration > limit) {
          end = limit;
        }

        idx = start;
        for (idx; idx <= end; idx++) {
          d[idx] = idx;
        }
      } else {
        match = string[i].match(/(\d*)/);
        if (!(match)) {
          continue;
        }

        d[parseInt(string[i], 10)] = parseInt(string[i], 10);
      }
    }
    return d;
  } else {
    if (string.indexOf('-') > -1) {
      // range
      match = string.match(/(\d*)(-+)(\d*)/);

      if (!(match)) {
        return {};
      }

      start = parseInt(match[1], 10);
      end = parseInt(match[3], 10);

      if (start > end) {
        start = parseInt(match[3], 10);
        end = parseInt(match[1], 10);
      }

      duration = end - start;
      if (duration > limit) {
        end = limit;
      }

      idx = start;
      for (idx; idx <= end; idx++) {
        d[idx] = idx;
      }
      return d;
    } else {
      // single number
      d = {};
      d[parseInt(string, 10)] = parseInt(string, 10);
      return d;
    }
  }
}

/**
 * Returns a string representation of an array.
 * eg. [1,2,3,..,250] results in '1-250'.
 * http://stackoverflow.com/questions/2270910/how-to-convert-sequence-of-numbers-in-an-array-to-range-of-numbers
 * @param  {Array} array input array
 * @return {string}      range string representation
 */
function getRanges(array) {
  var ranges = [];
  var rstart;
  var rend;
  for (var i = 0; i < array.length; i++) {
    rstart = array[i];
    rend = rstart;
    while (array[i + 1] - array[i] == 1) {
      rend = array[i + 1]; // increment the index if the numbers sequential
      i++;
    }
    ranges.push(rstart == rend ? rstart + '' : rstart + '-' + rend);
  }
  return ranges.join(', ');
}
