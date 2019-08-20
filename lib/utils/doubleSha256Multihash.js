const multihashes = require('multihashes');

/**
 * Hash payload using multihash
 *
 * @param {Buffer} payload
 *
 * @return {Buffer}
 */
function hash(payload) {
  return multihashes.encode(payload, 'dbl-sha2-256');
}

/**
 * Check if hash buffer is a valid multihash
 *
 * @param {Buffer} multihash
 *
 * @return {boolean}
 */
function validate(multihash) {
  try {
    multihashes.validate(multihash);
  } catch (e) {
    return false;
  }

  return true;
}

module.exports = {
  hash,
  validate,
};
