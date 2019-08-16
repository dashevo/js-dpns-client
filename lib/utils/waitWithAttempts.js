const wait = require('./wait');

/**
 * Sequentialy execute promise function
 *
 * @param {number} numberOfAttempts
 * @param {Function} asyncFunction
 *
 * @return {Promise<*>}
 */
async function waitWithAttempts(numberOfAttempts, asyncFunction) {
  const attempts = [...Array(numberOfAttempts).keys()];

  return attempts
    .reduce(
      async (previousPromise) => {
        const result = await previousPromise();

        if (!result) {
          await wait(1000);

          return asyncFunction();
        }

        attempts.splice(1);

        return result;
      },
      Promise.resolve(),
    );
}

module.exports = waitWithAttempts;
