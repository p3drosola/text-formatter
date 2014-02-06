var formatter = require('../src/formatter');
var fnode = formatter.fnode;
var utils = require('../src/utils');
var assert = require('assert');

describe('utils', function () {
  describe('bfSearch', function () {
    it('runs the function for every node in the tree', function () {
      var ast = [
        fnode('type', '1', [
          fnode('type', '2'),
          fnode('type', '3')
        ]),
        fnode('type', '4')
      ],
      result = '';

      utils.bfSearch(ast, function (node) {
        result += node.content + this;
      }, 'x');

      assert.equal(result, '1x2x3x4x');
    });
  });
});

