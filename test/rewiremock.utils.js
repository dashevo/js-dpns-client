// eslint-disable-next-line no-underscore-dangle
const rewiremock = (typeof global.__webpack_require__ === 'function')
  ? require('rewiremock/webpack')
  : require('rewiremock/node');

module.exports = rewiremock;
