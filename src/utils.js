// var _ = require('underscore');
var utils = {};

/**
 * Breadth first search
 * Runs fn for every node in the ast
 * @param  {Array[fnode] ast
 * @param  {Function} fn
 * @param  {Object} context
 */
utils.bfSearch = function (ast, fn, context) {
  _.each(ast, function (node) {
    fn.call(context, node);
    utils.bfSearch(node.children, fn, context);
  }, context);
};

module.exports = utils;
