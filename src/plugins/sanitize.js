/**
 * This plugin sanitizes input with google caja sanitizer
 *
 * https://code.google.com/p/google-caja/
 */

var caja = require('google-caja');

module.exports = {
  name: 'sanitize'
, parser: function (next, block) {
    var sanitized = caja.sanitize(block);
    return next(sanitized);
  }
};
