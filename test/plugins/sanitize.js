var formatter = require('../../src/formatter');
var plugin = require('../../src/plugins/sanitize');
var _ = require('underscore');
var assert = require('assert');
var sinon = require('sinon');

describe('plugin:sanitize', function () {
  describe('parser', function () {
    it('runs the content through a XSS HTML sanitizer', function () {
      var original = "<script>alert('xss');</script>hey there <b onclick='alert('xss')>amigo</b>";
      var clean = plugin.parser(_.identity, original);
      assert.equal(clean, 'hey there <b>amigo</b>');
    });
  });
});
