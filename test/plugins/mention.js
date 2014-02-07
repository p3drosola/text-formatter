var formatter = require('../../src/formatter');
var fnode = formatter.fnode;
var plugin = require('../../src/plugins/mention');
var assert = require('assert');
var sinon = require('sinon');

describe('plugin:mention', function () {
  describe('parser', function () {
    it('flags @mentions', function () {
       function next(block) {
        return [fnode('text', block)];
      }

      var text = "yo @frank what's up?"
       , result = plugin.parser(next, text);

      assert.equal(result.length, 3);
      assert.equal(result[0].type, 'text');
      assert.equal(result[1].type, 'mention');
      assert.equal(result[1].content, 'frank');
      assert.equal(result[2].type, 'text');

    });
  });
  describe('formatter', function () {
    it('formats mentions as links', function () {
      var result, n;
      n = fnode('mention', 'frank');
      result = plugin.formatter(n);
      assert.equal(result, '<a href="/users/frank" class="formatter-mention">@frank</a>');
    });
  });
});
