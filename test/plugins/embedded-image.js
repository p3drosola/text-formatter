var formatter = require('../../src/formatter');
var fnode = formatter.fnode;
var plugin = require('../../src/plugins/embedded-image');
var _ = require('underscore');
var assert = require('assert');
var sinon = require('sinon');

describe('plugin:embedded-image', function () {
  it('treeManipulator tags images', function () {
    var ast = [
      fnode('text', 'http://imghost.com/image.png'),
      fnode('link', 'http://imghost.com/image.png'),
      fnode('link', 'http://google.com')
    ];

    plugin.treeManipulator(ast);

    assert.equal(ast[0].type, 'text');
    assert.equal(ast[1].type, 'embedded-image');
    assert.equal(ast[2].type, 'link');
  });
  it('formats images as a linked image tag', function () {
    var node = fnode('embedded-image', 'http://teambox.com/image.png')
     , result = plugin.formatter(node);

    assert.equal(result, '<a class="formatter-embedded-image" href="http://teambox.com/image.png" target="_blank">' +
      '<img src="http://teambox.com/image.png" alt="http://teambox.com/image.png"/></a>');
  });
});


