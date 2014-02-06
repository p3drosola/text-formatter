/**
 * Returns a formatter AST tree node
 * @param {String} type
 * @param {String} content
 * @param {Array[fnode]} children
 */
module.exports = function (type, content, children) {
  return {
    type: type || 'text'
  , content: content || ''
  , children: children || []
  };
};
