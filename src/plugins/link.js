var _ = require('underscore')
, fnode = require('../fnode')
, template = _.template('<a class="formatter-link" href="<%=href%>" target="_blank"><%= text %></a>')
, plugin = {
    name: 'link'
  }

plugin.formatter = function (node) {
  return template({
    href: node.content
  , text: node.content
  });
};

// this parser should be re-written to be faster & cleaner
// tried doing it as a streaming parser out of curiosity
plugin.parser = function (next, block) {

  function getNextIndex(block, start_at) {
    var i, link = /https?:\/\/|file:\/\/|ftp:\/\//i;
    block = block.substring(start_at);
    i = block.search(link);
    if (block.length && i !== -1) {
      return start_at + i;
    }
    return -1;
  }

  var chunks = []
    , trailing_index = 0
    , link_index = getNextIndex(block, trailing_index)
    , link_end_index = 0
    , link_ender = /\s|$/i
    , href;

  while (link_index !== -1) {

    chunks = chunks.concat(next(block.substring(trailing_index, link_index)));
    link_end_index = link_index + block.substr(link_index).search(link_ender);
    href = block.substring(link_index, link_end_index);
    chunks.push(fnode('link', href));
    trailing_index = link_end_index;
    link_index = getNextIndex(block, trailing_index);
  }
  chunks = chunks.concat(next(block.substr(link_end_index)));
  return chunks;
};

module.exports = plugin;
