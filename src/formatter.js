var fnode = require('./fnode');
var utils = require('./utils');
var _ = require('underscore');

var formatter = {
  plugins: {}
, options: {}
};

/**
 * Configures the formatter
 * @param  {Object} options
 *  - plugin_order {Array[String]} an array of plugin names in the right order of priority
 */
formatter.setOptions = function (options) {
  formatter.options = options;
  // so it throws an error if the config is wrong
  return formatter.getOptions();
};

/**
 * Returns the options object
 * @return {Object}
 */
formatter.getOptions = function () {
  if (!_.isArray(formatter.options.plugin_order)) {
    var plugin_names = _.pluck(formatter.plugins, 'name').join(', ');
    throw new Error('Missing plugin_order array. Available plugins: ' + plugin_names);
  }
  return formatter.options;
};

/**
 * Adds a plugin to the formatter
 * @param {Object} plugin
 *   - name {String}
 *   - parser ? {Function}
 *   - treeManipulator ? {Function}
 *   - formatter ? {Function}
 */
formatter.addPlugin = function (plugin) {
  if (!plugin.name) {
    throw new Error('plugin missing name');
  }
  this.plugins[plugin.name] = plugin;
};

/**
 * Access plugins by name
 * @param  {String} name
 * @return {Object} plugin
 */
formatter.getPlugin = function (name) {
  return this.plugins[name];
};

/**
 * Returns the plugin objects in the propper order
 * @return {Array[Object]}
 */
formatter.getPluginsInOrder = function () {
  return _.map(formatter.getOptions().plugin_order, function (name) {
    var plugin = formatter.getPlugin(name);
    if (!plugin) {
      throw new Error('Missing plugin: ' + name);
    }
    return plugin;
  });
};

/**
 * Returns an array of curried parsers
 * @return {Array[Function]}
 */
formatter.getParserChain = function () {
  return _.reduceRight(formatter.getPluginsInOrder(), function (memo, plugin) {
    if (plugin.parser) {
      memo.unshift(_.partial(plugin.parser, _.first(memo)));
    }
    return memo;
  }, []);
};

/**
 * Runs the parser chain on a string
 * @param  {String} text
 * @return {Array[fnode]} ast
 */
formatter.runParsers = function (text) {
  return formatter.getParserChain()[0](text);
};

/**
 * Runs all the tree manipulators in the correct order
 * @param  {Array[fnode]} ast
 * @return {Array[fnode]}
 */
formatter.runTreeManipulators = function (ast) {
  _.each(formatter.getPluginsInOrder(), function (plugin) { // TODO: reverse order?
    if (plugin.treeManipulator) {
      plugin.treeManipulator(ast);
    }
  });
  return ast;
};

/**
 * Runs the formatters on an ast in the right order
 * @param  {Array[fnode]} ast
 * @return {String}
 */
formatter.runformatters = function (ast) {
  return _.map(ast, function (node) {
    var plugin = formatter.getPlugin(node.type);
    return plugin.formatter(node);
  }).join('');
};

/**
 * Runs the entire formatting process
 * @param {String} text
 */
formatter.format = _.compose(formatter.runformatters, formatter.runTreeManipulators, formatter.runParsers);

formatter.fnode = fnode;
module.exports = formatter;

