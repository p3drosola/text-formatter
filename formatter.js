var formatter = require('./src/formatter');

/*

  Edit this file to build a bundle that's suited for your use case

  Run `gulp build` to build the bundle into the `/build` dir.

  The order of these plugins is very important, so take it into account
 */


formatter.use(
  require('./src/plugins/pastie')    // flags any text with a new line as a "pastie". formats as a 'pre'
, require('./src/plugins/sanitize')  // sanitizes input with google caja sanitizer

, require('./src/plugins/link')
, require('./src/plugins/embedded-image') // parses links, formats as anchors
, require('./src/plugins/cloudapp-image') // embeds linked images
, require('./src/plugins/mention') // parses @mentions, makes them anchors

, require('./src/plugins/emoji') // parses & embeds :emojis:

, require('./src/plugins/text'));  // this is the basic text parser. should always be at the bottom

module.exports  = formatter;


