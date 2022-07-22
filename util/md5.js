const crypto = require('crypto');

module.exports = (str) => {
  return crypto
    .createHash('md5')
    .update('wpe(&1,3!@%so' + str)
    .digest('hex');
};
