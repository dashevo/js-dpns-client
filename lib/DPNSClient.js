const DashPlatformProtocol = require('@dashevo/dpp');

const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');

const registerMethodFactory = require('./method/registerMethodFactory');
const resolveMethodFactory = require('./method/resolveMethodFactory');
const resolveByRecordMethodFactory = require('./method/resolveByRecordMethodFactory');
const searchMethodFactory = require('./method/searchMethodFactory');

const InvalidArgumentError = require('./errors/InvalidArgumentError');

/**
 * DPNS client
 */
class DPNSClient {
  /**
   * @param {DAPIClient} dapiClient
   * @param {Wallet} wallet
   * @param {string} dpnsIdentityId
   */
  constructor(dapiClient, wallet, dpnsIdentityId) {
    const dpp = new DashPlatformProtocol({
      dataProvider: {},
    });

    const isEnvPresent = process && process.env;

    const contractId = dpnsIdentityId || (isEnvPresent ? process.env.DPNS_IDENTITY_ID : null);

    if (!contractId) {
      throw new InvalidArgumentError('DPNS identity id is unknown');
    }

    const dataContract = dpp.dataContract.create(
      contractId, dpnsDocuments,
    );

    this.register = registerMethodFactory(dapiClient, dpp, wallet, dataContract);
    this.resolve = resolveMethodFactory(dapiClient, dpp, dataContract);
    this.resolveByRecord = resolveByRecordMethodFactory(dapiClient, dpp, dataContract);
    this.search = searchMethodFactory(dapiClient, dpp, dataContract);
  }
}

module.exports = DPNSClient;
