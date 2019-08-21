const DashPlatformProtocol = require('@dashevo/dpp');
const Contract = require('@dashevo/dpp/lib/contract/Contract');

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
   * @param {wallet} wallet
   * @param {buser} bUser
   */
  constructor(dapiClient, wallet, bUser) {
    this.dapiClient = dapiClient;
    this.wallet = wallet;
    this.dpp = new DashPlatformProtocol();
    this.dpp.setContract(new Contract('dpnsContract', dpnsDocuments));

    this.registerMethod = registerMethodFactory(dapiClient, this.dpp, wallet, bUser);
    this.resolveMethod = resolveMethodFactory(dapiClient, this.dpp);
    this.resolveByRecordMethod = resolveByRecordMethodFactory(dapiClient, this.dpp);
    this.searchMethod = searchMethodFactory(dapiClient, this.dpp);
  }

  /**
   * Register a domain
   *
   * @param {string} name
   *
   * @returns {Promise<Document>}
   */
  async register(name) {
    if (!name) {
      throw new InvalidArgumentError('Invalid argument: name');
    }

    return this.registerMethod(name);
  }

  /**
   * Resolve domain by name
   *
   * @param {string} name
   *
   * @returns {Promise<Document>}
   */
  async resolve(name) {
    if (!name) {
      throw new InvalidArgumentError('Invalid argument: name');
    }

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
    if (!record) {
      throw new InvalidArgumentError('Invalid argument: record');
    }

    if (!value) {
      throw new InvalidArgumentError('Invalid argument: value');
    }

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
    if (!labelPrefix) {
      throw new InvalidArgumentError('Invalid argument: labelPrefix');
    }

    if (!parentDomainName) {
      throw new InvalidArgumentError('Invalid argument: parentDomainName');
    }

    return this.searchMethod(labelPrefix, parentDomainName);
  }
}

module.exports = DPNSClient;
