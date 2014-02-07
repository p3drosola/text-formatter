text-formatter
==============

<a href="http://teambox.com"><img alt="Built at Teambox" src="http://i.imgur.com/hqNPlHe.png"/></a>

![Build Status](https://travis-ci.org/p3drosola/text-formatter.png)

This code formats user generated text, with a series of customizable enhancements (plugins) such as autolinking urls, linking @mentions, embedding images, etc. While avoiding XSS vulnerabilities.

![screen shot 2014-02-07 at 15 53 40](https://f.cloud.github.com/assets/520550/2110835/10bc104a-9009-11e3-9832-fafa7393ca5b.png)

## Why do I need this?

You might be asking yourself why I'd write a whole library for this, when a couple regexes can get the job done. The problem is that once you start running regexes on the output of regexes, they start interacting with eachother, and create XSS vulnerabilities. So this library is designed like a compiler. It has three fases.

- parse
- tree manipulation
- formatting

Each of the plugins can add functionality at any of three fases.

### Fase 1: Parse

In the parsing fase, the text string is parsed into a an [AST](http://en.wikipedia.org/wiki/Abstract_syntax_tree).

![](http://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Abstract_syntax_tree_for_Euclidean_algorithm.svg/800px-Abstract_syntax_tree_for_Euclidean_algorithm.svg.png)

Check `src/fnode.js` to see what each of the nodes look like.

The parsers from the plugins are tied together into a parser chain (see src/formatter.js#getParserChain) the order of the plugins is very important, and is how we prevent XSS vulnerabilities.

Each parser function has the following singnature:

```javascript
plugin.parser = function(next, block) {}
```

Where next, is the next function is the parser chain, and block is the string of text to parse. It returns an array of AST nodes.

For example: the link parser when passed the block: `hello http://google.com/ there` whould return `[next("hello "), fnode('link', 'http://google.com/'), next(" there")]`.

In other words, it says "I've detected a link. I know how to handle this, no one else needs to touch this" and passes the text on either side onto the `next` parser which may be able to exract more information from it (eg: emojis)

### Fase 2: Tree Manipulation

In fase 2, plugins can manipulate the generated AST. For example the `embedded-image` plugin runs through the AST and checks all the `link` nodes. If the node points to an image it flags it as a "embedded-image" node. But it doesn't need to do any actual parsing, because all image links are already normal links.


The function signature is:
```javascript
plugin.treeManipulator = function (tree) {}
```
Where `tree` is the AST.

### Fase 3: Formatting

In the last step, each node is turned into a string by it's corresponding formatter, and all these strings are smashed back together.

For example a link node will be formatted by the `link` formatter.

```javascript
/**
 * Link formatter
 * @param  {Object} node
 * @return {String}
 */
plugin.formatter = function (node) {
  return "<a href='" + node.content + "'>" + node.content + "</a>";
};
```

## Install

To get started you should fork this repo, and clone it onto your machine.

Then run `npm install -g gulp && npm install`

## Getting started

Open `exmaple/index.html` to see the text-formatter in action.

We've included a number of plugins you can customize, or use as a starting point for your own.

Edit the file `formatter.js` to make your selection of plugins, and change their order.

Please send a PR if you write a plugin other people might find usefull.

## Building

Make sure the tests are passing: `gulp test`

And then build with `gulp build --debug=true` if you want sourcemaps, or just `gulp build` if not.

It uses browserify to build the bundle into `build/`.

Happy hacking!
