var formatter = require('../../src/formatter');
var plugin = require('../../src/plugins/text');
var _ = require('underscore');
var assert = require('assert');
var sinon = require('sinon');

describe('plugin:text', function () {
  describe('parser', function () {
    it('returns an array with a single fnode', function () {
      var original = "one two three";
      var ast = plugin.parser(_.identity, original);

      assert.equal(ast.length, 1);
      assert.equal(ast[0].content, original);
    });
  });
  describe('formatter', function () {
    it('returns the node content as a string', function () {
      var content = 'ola k dise?';
      var fnode = formatter.fnode('text', content);
      var result = plugin.formatter(fnode);

      assert.equal(result, content);
    });
  });
});



