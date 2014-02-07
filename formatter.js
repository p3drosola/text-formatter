var formatter = require('./src/formatter');

formatter.use(
  require('./src/plugins/pastie')
, require('./src/plugins/sanitize')

, require('./src/plugins/link')
, require('./src/plugins/embedded-image')
, require('./src/plugins/cloudapp-image')
, require('./src/plugins/mention')

, require('./src/plugins/emoji')

, require('./src/plugins/text'));

module.exports  = formatter;

// export for the browser
// you can change this name if it conflicts with something in your environment
if (process.browser) {
  global.formatter = formatter;
}
