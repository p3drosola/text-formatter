var caja = require('google-caja');

module.exports = {
  name: 'sanitize'
, parser: function (next, block) {
    var sanitized = caja.sanitize(block);
    return next(sanitized);
  }
};
