var formatter = require('../../src/formatter');
var fnode = formatter.fnode;
var plugin = require('../../src/plugins/emoji');
var assert = require('assert');
var sinon = require('sinon');

describe('emoji', function () {
  it('parser flags emojis', function () {

    function next(block) {
      return [fnode('text', block)];
    }

    var text = "hey there :scream: stuff"
     , result = plugin.parser(next, text);

    assert.equal(result.length, 3);
    assert.equal(result[0].type, 'text');
    assert.equal(result[1].type, 'emoji');
    assert.equal(result[2].type, 'text');

    assert.equal(result[1].content, 'scream');
  });
  it('should not flag at the beginning of the line', function () {
    function next(block) {
      return [fnode('text', block)];
    }

    var text = 'scream'
     ,  result = plugin.parser(next, text);

    assert.equal(result.length, 1);
    assert.equal(result[0].type, 'text');
  });
  it('formats emojis as images', function () {
    var node = fnode('emoji', 'scream')
     , result = plugin.formatter(node);

    assert.equal(result, '<img class="formatter-emoji emoji" height="20" width="20" align="absmiddle" '
                        + 'src="/images/emojis/scream.png" alt="scream" title="scream">');
  });

});
