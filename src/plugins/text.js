/**
 * This is the basic "plain text" plugin
 */
module.exports = {
  name: 'text'
, parser: function (next, block) {
    return [fnode('text', block)];
  }
, formatter: function (node) {
    return node.content;
  }
};
