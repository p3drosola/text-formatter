var formatter = require('../../src/formatter');
var plugin = require('../../src/plugins/pastie');
var assert = require('assert');
var sinon = require('sinon');

describe('plugin:pastie', function () {
  describe('parser', function () {
    it('parses text with newlines as pastes', function () {

      var text = 'this \n is a pasted \n message'
      , next = sinon.stub()
      , ast = plugin.parser(next, text);

      assert(!next.called);
      assert.equal(ast.length, 1);
      assert.equal(ast[0].type, 'pastie');
      assert.equal(ast[0].content, text);
    });
    it('does not parse text without newlines', function () {

      var text = 'this is a message'
      , next = sinon.stub().returns([1, 2, 3])
      , ast = plugin.parser(next, text);

      assert.deepEqual(ast, [1, 2, 3]);
    });
  });
  describe('formatter', function () {
    it('wraps blocks in .formatter-pastie', function () {
      var node = formatter.fnode('pastie', 'hey!')
       , result = plugin.formatter(node);

      assert(result.indexOf('formatter-pastie') !== -1);
    });
  });
});
