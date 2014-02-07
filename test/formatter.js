var assert = require("assert");
var sinon = require('sinon');
var formatter = require("../src/formatter");
var fnode = formatter.fnode;
var _ = require('underscore');

describe('formatter', function () {

  describe('addPlugin', function () {

    it('should add plugins to the plugins object', function () {
      formatter.plugins = {};
      formatter.addPlugin({name: 'foo'});
      formatter.addPlugin({name: 'bar'});

      assert.equal(formatter.plugins.foo.name, 'foo');
      assert.equal(formatter.plugins.bar.name, 'bar');
    });
    it('should throw an error if plugin is missing the name', function () {
      formatter.plugins = {};
      assert.throws(function () {
        formatter.addPlugin({no_name: 'foo'});
      }, Error);
    });

  });
  describe('getPlugin', function () {
    it('should return a reference to th plugin', function () {
      formatter.plugins = {};
      formatter.addPlugin({name: 'foo'});
      assert.equal(formatter.getPlugin('foo').name, 'foo');
    });
  });
  describe('setOptions', function () {
    it('should throw if no plugin_order is present', function () {
      assert.throws(function () {
        formatter.setOptions({});
      }, Error);
    });
  });
  describe('getOptions', function () {
    it('should return a reference to the options object', function () {
      var options = {plugin_order: ['xss', 'link', 'image']};
      formatter.setOptions(options);
      assert.equal(formatter.getOptions(), options);
    });
  });
  describe('getPluginsInOrder', function () {
    it('should return a reference to the plugins in te right order', function () {
      formatter.plugins = {};
      formatter.options.plugin_order = ['xss', 'link', 'image'];
      formatter.addPlugin({name: 'image'});
      formatter.addPlugin({name: 'xss'});
      formatter.addPlugin({name: 'link'});

      assert.deepEqual(_.pluck(formatter.getPluginsInOrder(), 'name'), ['xss', 'link', 'image']);
    });
    it('should throw an error if missing a plugin', function () {
      formatter.plugins = {};
      formatter.options.plugin_order = ['xss', 'link', 'image'];
      formatter.addPlugin({name: 'image'});
      formatter.addPlugin({name: 'xss'});

      assert.throws(function () {
        formatter.getPluginsInOrder();
      }, Error);
    });
  });

  describe('getParserChain', function () {
    it('builds a linked parser chain', function () {
      formatter.plugins = {
        foo: {
          name: 'foo'
        , parser: function (next, text) {
            // the foo parser creates a foo node,
            //  and passes the content to the next
            return [fnode('foo', 'xxx', next(text))];
          }
        },
        bar: {
          name: 'bar'
        , parser: function (next, text) {
            // the bar parser always returns 2 bar nodes
            return [fnode('bar', 'xxx'), fnode('bar', 'bar')];
          }
        }
      };

      formatter.setOptions({plugin_order: ['foo', 'bar']});

      var chain = formatter.getParserChain()
      , ast = chain[0]('nothing here');

      assert.equal(chain.length, 2);
      assert.equal(ast.length, 1);
      assert.equal(ast[0].type, 'foo');
      assert.equal(ast[0].children.length, 2);
      assert.equal(ast[0].children[0].type, 'bar');
      assert.equal(ast[0].children[1].type, 'bar');
      assert.equal(ast[0].children[0].children.length, 0);
    });
    it('accepts handlers without parsers', function () {
      formatter.plugins = {
        foo: {
          name: 'foo'
        , parser: function (next, text) {
            // the foo parser creates a foo node,
            //  and passes the content to the next
            return [fnode('foo', 'xxx', next(text))];
          }
        },
        bar: {
          name: 'bar'
        , parser: function (next, text) {
            // the bar parser always returns 2 bar nodes
            return [fnode('bar', 'xxx'), fnode('bar', 'bar')];
          }
        },
        bob: {
          name: 'bob'
        }
      };

      formatter.setOptions({plugin_order: ['bob', 'foo', 'bar']});

      var chain = formatter.getParserChain()
      , ast = chain[0]('nothing here');

      assert.equal(chain.length, 2);
    });
  });

  describe('runParsers', function () {
    it('should run the first parser in the chain', function () {
      var parser = sinon.spy();
      sinon.stub(formatter, 'getParserChain').returns([parser]);
      formatter.runParsers('foo');
      assert(parser.calledOnce);
      formatter.getParserChain.restore();
    });
  });

  describe('runTreeManipulators', function () {
    it('runs all the treeManipulators in order', function () {
      var ast = [
        fnode('text', 'hello there ')
      , fnode('link', 'http://google.com')
      , fnode('text', ' alright!')
      ];

      formatter.plugins = {
        link: {
          name: 'link'
        , treeManipulator: function (ast) {
            _.each(ast, function (node) {
              if (node.type === 'link') {
                node.type = 'link2';
              }
            });
            return ast;
          }
        },
        text: {
          name: 'text'
        , treeManipulator: function (ast) {
            _.each(ast, function (node) {
              if (node.type === 'link2') {
                node.type = 'link3';
              }
            });
            return ast;
          }
        }
      };

      formatter.setOptions({plugin_order: ['link', 'text']});
      formatter.runTreeManipulators(ast);

      assert.equal(ast.length, 3);
      assert.equal(ast[0].type, 'text');
      assert.equal(ast[1].type, 'link3');
      assert.equal(ast[2].type, 'text');
    });
    it('accepts plugins without treeManipulators', function () {
      var ast = [
        fnode('text', 'hello there ')
      , fnode('link', 'http://google.com')
      , fnode('text', ' alright!')
      ];

      formatter.plugins = {
        link: {
          name: 'link'
        , treeManipulator: function (ast) {
            _.each(ast, function (node) {
              if (node.type === 'link') {
                node.type = 'link2';
              }
            });
            return ast;
          }
        },
        text: {
          name: 'text'
        , treeManipulator: function (ast) {
            _.each(ast, function (node) {
              if (node.type === 'link2') {
                node.type = 'link3';
              }
            });
            return ast;
          }
        },
        bob: {
          name: 'bob'
        }
      };

      formatter.setOptions({plugin_order: ['link', 'text', 'bob']});

      formatter.runTreeManipulators(ast);

      assert.equal(ast.length, 3);
      assert.equal(ast[0].type, 'text');
      assert.equal(ast[1].type, 'link3');
      assert.equal(ast[2].type, 'text');
    });
  });

  describe('runformatters', function () {
    it('runs all the formatters', function () {
      var result, ast;
      ast = [
        fnode('paragraph', '', [
          fnode('text', 'Check out ')
        , fnode('link', 'http://google.com')
        , fnode('text', ' sometime.')
        ])
      ];

      formatter.plugins = {
        paragraph: {
          name: 'paragraph'
        , formatter: function (node) {
            return '<p>' + formatter.runformatters(node.children) + '</p>';
          }
        },
        link: {
          name: 'link'
        , formatter: function (node) {
            return "<a href='" + node.content + "'>" + node.content + "</a>";
          }
        },
        text: {
          name: 'text'
        , formatter: function (node) {
            return node.content || '';
          }
        }
      };
      formatter.setOptions({plugin_order: ['paragraph', 'link', 'text']});

      result = formatter.runformatters(ast);
      assert.equal(result, "<p>Check out <a href='http://google.com'>http://google.com</a> sometime.</p>");
    });
    it('accepts plugins without formatters');
    it('accepts nodes without formatters');
  });




  //   describe('teambox-link', function () {
  //     it('treeManipulator tags teambox links', function () {
  //       var ast = [
  //         fnode('link', 'http://google.com/a/#!/users/3'),
  //         fnode('link', 'http://teambox.com/a/#!/users/3'),
  //         fnode('link', 'https://staging.sandbox2.teambox.com/a/#!/users/3'),
  //         fnode('link', 'https://localhost:8888/a/#!/users/3'),
  //         fnode('link', 'https://teambox.com/a/index.html#!/users/3'),
  //         fnode('link', 'https://teambox.com/a/#!/projects/56/tasks/3'),
  //         fnode('link', 'https://teambox.com/a/#!/dashboard/56/tasks/3'),
  //         fnode('link', 'http://localhost:8000/a/index.html#!/projects/5/notes/5')
  //       ];

  //       formatter.getPlugin('teambox-link').treeManipulator(ast);

  //       assert.equal(ast[0].type, 'link');

  //       assert.equal(ast[1].type, 'teambox-link');
  //       assert.equal(ast[1].teambox_type, 'users');
  //       assert.equal(ast[1].teambox_id, 3);

  //       assert.equal(ast[2].teambox_id, 3);

  //       assert.equal(ast[3].teambox_id, 3);

  //       assert.equal(ast[4].teambox_id, 3);

  //       assert.equal(ast[5].teambox_type, 'tasks');

  //       assert.equal(ast[6].teambox_type, 'tasks');

  //       assert.equal(ast[7].teambox_type, 'notes');

  //     });
  //     it('formats teambox links', function () {
  //       var node = fnode('teambox-link', 'http://teambox.com/a/#!/projects/5/tasks/3')
  //        , result;
  //       node.teambox_type = 'task';
  //       node.teambox_id = 3;
  //       result = formatter.getPlugin('teambox-link').formatter(node);
  //       assert.equal(result, '<a href="http://teambox.com/a/#!/projects/5/tasks/3" ' +
  //         'class="js-mention-link mention mention-icon mention_task" ' +
  //         'data-object-type="task" data-object-id="3" ><strong>task#3</strong></a>');
  //     });
  //     it('formats notes links properly', function () {
  //       var node = fnode('teambox-link', 'http://teambox.com/a/#!/projects/5/notes/3')
  //        , result;
  //       node.teambox_type = 'note';
  //       node.teambox_id = 3;
  //       result = formatter.getPlugin('teambox-link').formatter(node);
  //       assert.equal(result, '<a href="http://teambox.com/a/#!/projects/5/notes/3" ' +
  //         'class="js-mention-link mention mention-icon mention_page" ' +
  //         'data-object-type="page" data-object-id="3" ><strong>note#3</strong></a>');
  //     });
  //     it('includes the project name if found', function () {

  //       var node = fnode('teambox-link', 'http://teambox.com/a/#!/projects/5/tasks/3')
  //        , result;
  //       node.teambox_type = 'task';
  //       node.teambox_id = 3;
  //       node.project_id = 1;
  //       Teambox.Data.projects.add({id: 1, name: "Earthworks Yoga"});

  //       result = formatter.getPlugin('teambox-link').formatter(node);
  //       assert.equal(result, '<a href="http://teambox.com/a/#!/projects/5/tasks/3" ' +
  //         'class="js-mention-link mention mention-icon mention_task" ' +
  //         'data-object-type="task" data-object-id="3" >Earthworks Yoga: <strong>task#3</strong></a>');
  //     });
  //   });


});
