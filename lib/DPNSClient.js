const DashPlatformProtocol = require('@dashevo/dpp');

const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');

const entropy = require('@dashevo/dpp/lib/util/entropy');

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
   */
  constructor(dapiClient, wallet) {
    const dpp = new DashPlatformProtocol({
      dataProvider: {},
    });

    const dataContract = dpp.dataContract.create(
      process.env.DPNS_IDENTITY_ID, dpnsDocuments,
    );

    this.register = registerMethodFactory(dapiClient, dpp, wallet, entropy, dataContract);
    this.resolve = resolveMethodFactory(dapiClient, dpp, dataContract);
    this.resolveByRecord = resolveByRecordMethodFactory(dapiClient, dpp, dataContract);
    this.search = searchMethodFactory(dapiClient, dpp, dataContract);
  }
}

module.exports = DPNSClient;
