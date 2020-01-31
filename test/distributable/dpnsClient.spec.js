const { expect } = require('chai');
const DAPIClient = require('@dashevo/dapi-client');
const DPNSClient = require('../../lib/DPNSClient');

describe('DPNS client', function main() {
  this.timeout(10000);

  // This is a mock from a Wallet instance (wallet-lib)
  const walletMock = {
    getAccount: () => ({
      getIdentityPrivateKey: () => '',
    }),
  };
  it('should create a new DPNS Client instance', () => {
    const dapiClient = new DAPIClient();
    const dpnsClient = new DPNSClient(dapiClient, walletMock);
    // eslint-disable-next-line no-unused-expressions
    expect(dpnsClient).to.exists;
  });
});
