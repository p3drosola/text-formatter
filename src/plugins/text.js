/**
 * This is the basic "plain text" plugin
 *
 * It should always be the last one in the plugin chain
 */

var fnode = require('../fnode');

var plugin = {
  name: 'text'
, parser: function (next, block) {
    return [fnode('text', block)];
  }
, formatter: function (node) {
    return String(node.content);
  }
};

module.exports = plugin;

if (global.formatter) {
  formatter.addPlugin(plugin);
}
