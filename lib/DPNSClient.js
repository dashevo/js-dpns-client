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
   */
  constructor(dapiClient, wallet) {
    this.dapiClient = dapiClient;
    this.wallet = wallet;
    this.dpp = new DashPlatformProtocol();
    // TODO: figure out how to set a DPNS contract for dpp

    this.registerMethod = registerMethodFactory(dapiClient, this.dpp);
    this.resolveMethod = resolveMethodFactory(dapiClient);
    this.resolveByRecordMethod = resolveByRecordMethodFactory(dapiClient);
    this.searchMethod = searchMethodFactory(dapiClient);
  }

  /**
   * Register a domain
   *
   * @param {string} name
   * @param {string} regTxId
   *
   * @returns {Promise<Document>}
   */
  async register(name, regTxId) {
    // TODO: possibly validate arguments

    return this.registerMethod(name, regTxId);
  }

  /**
   * Resolve domain by name
   *
   * @param {string} name
   *
   * @returns {Promise<Document>}
   */
  async resolve(name) {
    // TODO: possibly validate `name` argument

    return this.resolveMethod(name);
  }

  /**
   * Resolve domain by it's record
   *
   * @param {string} record
   * @param {*} value
   *
   * @returns {Promise<Document>}
   */
  async resolveByRecord(record, value) {
    // TODO: possibly validate arguments

    return this.resolveByRecordMethod(record, value);
  }

  /**
   * Search domains by prefix and parent domain name
   *
   * @param {string} labelPrefix
   * @param {string} parentDomainName
   *
   * @returns {Promise<Document[]>}
   */
  async search(labelPrefix, parentDomainName) {
    // TODO: possibly validate arguments

    return this.searchMethod(labelPrefix, parentDomainName);
  }
}

module.exports = DPNSClient;
