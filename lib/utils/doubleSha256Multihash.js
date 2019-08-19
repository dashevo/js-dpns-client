const multihashes = require('multihashes');

function hash(payload) {
  return multihashes.encode(payload, 'dbl-sha2-256');
}

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
