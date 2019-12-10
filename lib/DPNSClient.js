const DashPlatformProtocol = require('@dashevo/dpp');

const registerMethodFactory = require('./method/registerMethodFactory');
const resolveMethodFactory = require('./method/resolveMethodFactory');
const resolveByRecordMethodFactory = require('./method/resolveByRecordMethodFactory');
const searchMethodFactory = require('./method/searchMethodFactory');

/**
 * DPNS client
 */
class DPNSClient {
  /**
   * @param {DAPIClient} dapiClient
   * @param {Wallet} wallet
   * @param {Identity} identity
   */
  constructor(dapiClient, wallet, identity) {
    const dpp = new DashPlatformProtocol();

    this.register = registerMethodFactory(dapiClient, dpp, wallet, identity);
    this.resolve = resolveMethodFactory(dapiClient, dpp);
    this.resolveByRecord = resolveByRecordMethodFactory(dapiClient, dpp);
    this.search = searchMethodFactory(dapiClient, dpp);
  }
}

module.exports = DPNSClient;
