var formatter = require('../../src/formatter');
var fnode = formatter.fnode;
var plugin = require('../../src/plugins/cloudapp-image');
var assert = require('assert');
var sinon = require('sinon');

describe('cloudapp-image', function () {
  it('treeManipulator tags cloudapp iamge links', function () {
    var ast = [fnode('link', 'http://cl.ly/image/35430L0p3m47')];
    plugin.treeManipulator(ast);
    assert.equal(ast[0].type, 'embedded-image');
    assert.equal(ast[0].content, 'http://cl.ly/image/35430L0p3m47/content');
  });
});
