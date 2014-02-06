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

  // describe('Plugins', function () {
  //   describe('pastie', function () {
  //     describe('parser', function () {
  //       it('parses text with newlines as pastes', function () {
  //         formatter.plugins = original_plugins;
  //         var text = 'this \n is a pasted \n message'
  //         , next = sinon.stub()
  //         , ast = formatter.getPlugin('pastie').parser(next, text);

  //         assert(!next.called);
  //         assert.equal(ast.length, 1);
  //         assert.equal(ast[0].type, 'pastie');
  //         assert.equal(ast[0].content, text);
  //       });
  //       it('does not parse text without newlines', function () {
  //         formatter.plugins = original_plugins;

  //         var text = 'this is a message'
  //         , next = sinon.stub().returns([1, 2, 3])
  //         , ast = formatter.getPlugin('pastie').parser(next, text);

  //         assert.deepEqual(ast, [1, 2, 3]);
  //       });
  //     });
  //     describe('formatter', function () {
  //       it('wraps blocks in .formatter-pastie', function () {
  //         formatter.plugins = original_plugins;
  //         var node = fnode('pastie', 'hey!')
  //          , result = formatter.getPlugin('pastie').formatter(node);

  //         assert($(result).hasClass('formatter-pastie'));
  //       });
  //     });
  //   });
  //   describe('sanitize', function () {
  //     it('parses input text to remove bad stuff, passes to next', function () {
  //       var next = sinon.stub();

  //       formatter.getPlugin('sanitize').parser(next, 'hey there <script>alert("foo")</script>hodor');
  //       assert(next.calledWith('hey there hodor'));
  //     });
  //   });
  //   describe('text', function () {
  //     describe('parser', function () {
  //       it('returns an array with one text node', function () {
  //         formatter.plugins = original_plugins;
  //         var ast = formatter.getPlugin('text').parser(undefined, 'hey!');

  //         assert.equal(ast.length, 1);
  //         assert.equal(ast[0].type, 'text');
  //         assert.equal(ast[0].content, 'hey!');
  //       });
  //     });
  //     describe('formatter', function () {
  //       it('returns the plain content', function () {
  //         formatter.plugins = original_plugins;
  //         var node = fnode('text', 'hey!')
  //          , result = formatter.getPlugin('text').formatter(node);
  //         assert.equal(result, 'hey!');
  //       });
  //     });
  //   });

  //   describe('embedded-image', function () {
  //     it('treeManipulator tags images', function () {
  //       var ast = [
  //         fnode('text', 'http://imghost.com/image.png'),
  //         fnode('link', 'http://imghost.com/image.png'),
  //         fnode('link', 'http://google.com')
  //       ];

  //       formatter.getPlugin('embedded-image').treeManipulator(ast);

  //       assert.equal(ast[0].type, 'text');
  //       assert.equal(ast[1].type, 'embedded-image');
  //       assert.equal(ast[2].type, 'link');
  //     });
  //     it('formats images as a linked image tag', function () {
  //       var node = fnode('embedded-image', 'http://teambox.com/image.png')
  //        , result = formatter.getPlugin('embedded-image').formatter(node);

  //       assert.equal(result, '<a class="formatter-embedded-image" href="http://teambox.com/image.png" target="_blank">' +
  //         '<img src="http://teambox.com/image.png" alt="http://teambox.com/image.png"/></a>');
  //     });
  //   });
  //   describe('emoji', function () {
  //     it('parser flags emojis', function () {

  //       function next(block) {
  //         return [fnode('text', block)];
  //       }

  //       Teambox.Data.emojis = {
  //         pluck: function () {
  //           return ['scream', 'smile', 'cry'];
  //         }
  //       };

  //       var text = "hey there :scream: stuff"
  //        , result = formatter.getPlugin('emoji').parser(next, text);

  //       assert.equal(result.length, 3);
  //       assert.equal(result[0].type, 'text');
  //       assert.equal(result[1].type, 'emoji');
  //       assert.equal(result[2].type, 'text');

  //       assert.equal(result[1].content, 'scream');

  //       delete Teambox.Data.emoji;

  //     });
  //     it('should not flag at the beginning of the line', function () {
  //       function next(block) {
  //         return [fnode('text', block)];
  //       }

  //       Teambox.Data.emojis = {
  //         pluck: function () {
  //           return ['scream', 'smile', 'cry'];
  //         }
  //       };

  //       var text = 'scream'
  //        ,  result = formatter.getPlugin('emoji').parser(next, text);

  //       assert.equal(result.length, 1);
  //       assert.equal(result[0].type, 'text');
  //     });
  //     it('formats emojis as images', function () {
  //       var node = fnode('emoji', 'scream')
  //        , result = formatter.getPlugin('emoji').formatter(node);

  //       assert.equal(result, '<img class="formatter-emoji emoji" height="20" width="20" align="absmiddle" '
  //                           + 'src="/images/emojis/scream.png" alt="scream" title="scream">');
  //     });

  //   });
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
  //   describe('cloudapp-image', function () {
  //     it('treeManipulator tags cloudapp iamge links', function () {
  //       var ast = [fnode('link', 'http://cl.ly/image/35430L0p3m47')];
  //       formatter.getPlugin('cloudapp-image').treeManipulator(ast);
  //       assert.equal(ast[0].type, 'embedded-image');
  //       assert.equal(ast[0].content, 'http://cl.ly/image/35430L0p3m47/content');
  //     });
  //   });
  //   describe('mention', function () {
  //     before(function () {
  //       Teambox.Data.users.add({
  //         first_name: 'Frank'
  //       , last_name: "Cramer"
  //       , username: 'frank'
  //       , id: 889
  //       , type: 'User'
  //       });
  //     });
  //     it('parser flags @mentions', function () {
  //        function next(block) {
  //         return [fnode('text', block)];
  //       }

  //       var text = "yo @frank what's up?"
  //        , result = formatter.getPlugin('mention').parser(next, text);

  //       assert.equal(result.length, 3);
  //       assert.equal(result[0].type, 'text');
  //       assert.equal(result[1].type, 'mention');
  //       assert.equal(result[1].content, 'frank');
  //       assert(result[1].user);
  //       assert.equal(result[2].type, 'text');

  //     });
  //     it('parser flags @all mentions', function () {
  //        function next(block) {
  //         return [fnode('text', block)];
  //       }

  //       var text = "hey @all what's up?"
  //        , result = formatter.getPlugin('mention').parser(next, text);

  //       assert.equal(result.length, 3);
  //       assert.equal(result[0].type, 'text');
  //       assert.equal(result[1].type, 'mention');
  //       assert.equal(result[1].content, 'all');
  //       assert(!result[1].user);
  //       assert.equal(result[2].type, 'text');

  //     });
  //     it('formats mentions as links', function () {
  //       var result, fnode;
  //       fnode = fnode('mention', 'frank');
  //       fnode.user = Teambox.Data.users.get(889);
  //       result = formatter.getPlugin('mention').formatter(fnode);
  //       assert.equal(result, '<a href="#!/users/889" class="mention js-mention-link" data-object-type="user" data-object-id="889">Frank Cramer</a>');
  //     });
  //     it('formats @all mentions without internal-linking', function () {
  //       var result, fnode;
  //       fnode = fnode('mention', 'all');
  //       result = formatter.getPlugin('mention').formatter(fnode);
  //       assert.equal(result, '<a class="mention">@all</a>');
  //     });
  //   });
  // });
});
