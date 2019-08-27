module.exports = function createWalletMock(sinonSandbox) {
  return {
    getAccount: sinonSandbox.stub(),
  };
};
