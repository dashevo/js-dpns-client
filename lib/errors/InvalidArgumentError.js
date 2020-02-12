class InvalidArgumentError extends Error {
  constructor(...params) {
    super(...params);

    this.name = this.constructor.name;
  }
}

module.exports = InvalidArgumentError;
