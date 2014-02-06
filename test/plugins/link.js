var formatter = require('../../src/formatter');
var plugin = require('../../src/plugins/link');
var fnode = formatter.fnode;
var assert = require('assert');

describe('plugin:link', function () {
  describe('parser', function () {
    it('returns an array link nodes marked', function () {

      // dud parser
      function next(text) {
        return [fnode('text', text)];
      }

      var ast = plugin.parser(next, 'hodor http://google.com howdy');

      assert.equal(ast.length, 3);
      assert.equal(ast[0].type, 'text');
      assert.equal(ast[1].type, 'link');
      assert.equal(ast[0].type, 'text');

      assert.equal(ast[0].content, 'hodor ');
      assert.equal(ast[1].content, 'http://google.com');
      assert.equal(ast[2].content, ' howdy');
    });
  });
  describe('formatter', function () {
    it('returns an anchor', function () {
      var node = fnode('link', 'http://google.com')
       , result = plugin.formatter(node);

      assert.equal(result,
        '<a class="formatter-link" href="http://google.com" ' +
        'target="_blank">http://google.com</a>');
    });
  });
});
