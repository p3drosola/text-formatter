/**
 * This plugin sanitizes input with google caja sanitizer
 *
 * https://code.google.com/p/google-caja/
 */

var caja = require('google-caja');

var plugin = {
  name: 'sanitize'
, parser: function (next, block) {
    var sanitized = caja.sanitize(block);
    return next(sanitized);
  }
};

module.exports = plugin;

if (global.formatter) {
  formatter.addPlugin(plugin);
}
