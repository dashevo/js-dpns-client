/**
 * Async version of wait
 *
 * @param {number} ms
 */
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports = wait;
