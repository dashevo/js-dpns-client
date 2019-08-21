const wait = require('./wait');

/* eslint-disable no-await-in-loop */

/**
 * Sequentially execute promise function
 *
 * @param {number} numberOfAttempts
 * @param {Function} asyncFunction
 * @param {number} timeToWait
 *
 * @return {Promise<*>}
 */
async function waitWithAttempts(numberOfAttempts, asyncFunction, timeToWait = 1000) {
  let result = null;
  let tries = 0;

  while (!result && tries < numberOfAttempts) {
    result = await asyncFunction();

    if (!result) {
      await wait(timeToWait);
    }

    tries += 1;
  }

  return result;
}

module.exports = waitWithAttempts;
