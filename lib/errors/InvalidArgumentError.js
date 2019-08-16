class InvalidArgumentError extends Error {
  /**
   * @param {string} message
   * @param {object} context
   */
  constructor(message, context) {
    super(message);

    this.context = context;
  }

  /**
   * Get error context
   *
   * @return {object}
   */
  getContext() {
    return this.context;
  }
}

module.exports = InvalidArgumentError;
