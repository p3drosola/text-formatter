/**
 * This flags any text with a new line as a "pastie"
 *
 * pasties are displayed as "pre" block.
 */


var fnode = require('../fnode');
var _ = require('underscore');
var template = _.template('<div class="formatter-pastie"><pre><%= content %></pre></div>');

module.exports = {
  name: 'pastie'
, parser: function (next, block) {
    var i = block.indexOf('\n');
    if (i !== -1) {
      return [fnode('pastie', _.escape(block))];
    } else {
      return next(block);
    }
  }
, formatter: function (node) {
    return template(node);
  }
};
