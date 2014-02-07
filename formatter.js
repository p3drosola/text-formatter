var formatter = require('./src/formatter');

var pastie = require('./src/plugins/pastie')(formatter);
var sanitize = require('./src/plugins/sanitize')(formatter);
var link = require('./src/plugins/link')(formatter);
var text = require('./src/plugins/text')(formatter);

if (process.browser) {
  window.formatter = formatter.use(pastie, sanitize, text);
}

