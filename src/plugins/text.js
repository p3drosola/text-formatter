/**
 * This is the basic "plain text" plugin
 *
 * It should always be the last one in the plugin chain
 */

var fnode = require('../fnode');


module.exports = {
  name: 'text'
, parser: function (next, block) {
    return [fnode('text', block)];
  }
, formatter: function (node) {
    return String(node.content);
  }
};
