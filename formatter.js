var formatter = require('./src/formatter');

var pastie = require('./src/plugins/pastie');
var sanitize = require('./src/plugins/sanitize');
var link = require('./src/plugins/link');
var text = require('./src/plugins/text');

if (process.browser) {
  window.formatter = formatter.use(pastie, sanitize, text);
}

