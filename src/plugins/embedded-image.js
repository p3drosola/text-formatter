/*
 * This plugin implements a treeManipulator
 * it scans existing link nodes to see if they link to an image
 * this cuts down on parsing work
 */
var _ = require('underscore');
var utils = require('../utils');
var template = _.template('<a class="formatter-embedded-image" href="<%= src %>" target="_blank">' +
                            '<img src="<%= src %>" alt="<%= src %>"/></a>');
var plugin = {
  name: 'embedded-image'

, treeManipulator: function (tree) {
    utils.bfSearch(tree, function (node) {
      if (node.type === 'link' && node.content.match(/\.(png|jpg|jpeg|gif)$/)) {
        node.type = 'embedded-image';
      }
    });
  }

, formatter: function (node) {
    return template({
      src: node.content
    });
  }
};

module.exports = plugin;
