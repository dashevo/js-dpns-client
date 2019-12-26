const bs58 = require('bs58');

const entropy = require('@dashevo/dpp/lib/util/entropy');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');

const InvalidArgumentError = require('../errors/InvalidArgumentError');

/**
 * Register a domain (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {Wallet} wallet
 *
 * @param {DataContract} dataContract
 *
 * @return {registerMethod}
 */
function registerMethodFactory(dapiClient, dpp, wallet, dataContract) {
  /**
   * Register a domain
   *
   * @typedef registerMethod
   *
   * @param {string} name
   * @param {Identity} user
   * @param {{ dashIdentity: string }} records
   *
   * @returns {Promise<Document>}
   */
  async function registerMethod(name, user, records) {
    if (!name) {
      throw new InvalidArgumentError('Invalid argument: name');
    }

    if (!user) {
      throw new InvalidArgumentError('Invalid argument: user');
    }

    if (!records) {
      throw new InvalidArgumentError('Invalid argument: records');
    }

    const account = wallet.getAccount();
    const privateKey = account.getIdentityPrivateKey(0);

    const nameLabels = name.split('.');

    const normalizedParentDomainName = nameLabels
      .slice(1)
      .join('.')
      .toLowerCase();

    const [label] = nameLabels;
    const normalizedLabel = label.toLowerCase();

    const preorderSalt = entropy.generate();

    const fullDomainName = normalizedParentDomainName
      ? `${normalizedLabel}.${normalizedParentDomainName}`
      : normalizedLabel;

    const nameHash = hash(
      Buffer.from(fullDomainName),
    ).toString('hex');

    const slatedDomainHashBuffer = Buffer.concat([
      bs58.decode(preorderSalt),
      Buffer.from(nameHash, 'hex'),
    ]);

    const saltedDomainHash = hash(
      slatedDomainHashBuffer,
    ).toString('hex');

    // 1. Create preorder document
    const preorderDocument = dpp.document.create(
      dataContract,
      user.getId(),
      'preorder',
      {
        saltedDomainHash,
      },
    );

    // 2. Create and send preorder state tranisition
    const preorderTransition = dpp.document.createStateTransition([preorderDocument]);
    preorderTransition.sign(user.getPublicKeyById(0), privateKey);

    await dapiClient.applyStateTransition(preorderTransition);

    // 3. Create domain document
    const domainDocument = dpp.document.create(
      dataContract,
      user.getId(),
      'domain',
      {
        nameHash,
        label,
        normalizedLabel,
        normalizedParentDomainName,
        preorderSalt,
        records,
      },
    );

    // 4. Create and send domain state transition
    const domainTransition = dpp.document.createStateTransition([domainDocument]);
    domainTransition.sign(user.getPublicKeyById(0), privateKey);

    await dapiClient.applyStateTransition(domainTransition);

    return domainDocument;
  }

  return registerMethod;
}

module.exports = registerMethodFactory;
