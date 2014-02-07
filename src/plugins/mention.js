/*
  This plugin formats & autolinks @mentions
 */

var _ = require('underscore');
var utils = require('../utils');
var fnode = require('../fnode');

var all_regex = new RegExp(/(?:^|\s)(@all)(?:$|\s)/gi);
var regex = new RegExp(/(@(?:[\w._\-]+)\b)/gi);
var template = _.template('<a href="<%= href %>" class="formatter-mention"><%= name %></a>');

module.exports = {
  name: 'mention'

, parser: function (next, block) {
    var parts = block.split(regex)
     , result = [];
    parts = _.each(parts, function (part) {
      var username, n;
      if (part.match(regex)) {
        username = part.replace('@', '');
        n = fnode('mention', username);
        result.push(n);
      } else  {
        result = result.concat(next(part));
      }
    });
    return result;
  }

, formatter: function (node) {
    return template({
      href: '/users/' + node.content
    , name: '@' + node.content
    });
  }
};
