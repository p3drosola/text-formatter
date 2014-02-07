var regex = /https?:\/\/cl\.ly\/image\/([a-zA-Z0-9]+)$/;
var utils = require('../utils');

module.exports= {
  name: 'cloudapp-image'

, treeManipulator: function (tree) {
    utils.bfSearch(tree, function (node) {
      if (node.type === 'link' && node.content.match(regex)) {
        node.type = 'embedded-image';
        node.content += '/content';
      }
    });
  }
};
