const entropy = require('@dashevo/dpp/lib/util/entropy');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');

const InvalidArgumentError = require('../errors/InvalidArgumentError');

const waitWithAttempts = require('../utils/waitWithAttempts');

/**
 * Register a domain (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {Wallet} wallet
 * @param {Identity} identity
 * @param {DataContract} dataContract
 *
 * @return {registerMethod}
 */
function registerMethodFactory(dapiClient, dpp, wallet, identity, dataContract) {
  /**
   * Register a domain
   *
   * @typedef registerMethod
   *
   * @param {string} name
   *
   * @returns {Promise<Document>}
   */
  async function registerMethod(name) {
    if (!name) {
      throw new InvalidArgumentError('Invalid argument: name');
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

    const saltedDomainHash = hash(
      Buffer.from(preorderSalt + name),
    ).toString('hex');

    // 1. Create preorder document
    const preorderDocument = dpp.document.create(
      dataContract,
      identity.getId(),
      'preorder',
      {
        saltedDomainHash,
      },
    );

    // 2. Create and send preorder state tranisition
    const preorderTransition = dpp.document.createStateTransition([preorderDocument]);
    preorderTransition.sign(identity.getPublicKeyById(0), privateKey);

    await dapiClient.updateState(preorderTransition);

    // 3. Wait until preorder state transition is confirmed
    await waitWithAttempts(10, async () => dapiClient
      .fetchDocuments(
        dataContract.getId(),
        'preorder',
        {
          where: [[
            'saltedDomainHash', '==', saltedDomainHash,
          ]],
        },
      ));

    // 4. Create domain document
    const nameHash = hash(Buffer.from(name)).toString('hex');

    const domainDocument = dpp.document.create(
      dataContract,
      identity.getId(),
      'domain',
      {
        nameHash,
        label,
        normalizedLabel,
        normalizedParentDomainName,
        preorderSalt,
        records: {
          dashIdentity: identity.getId(),
        },
      },
    );

    // 5. Create and send domain state transition
    const domainTransition = dpp.document.createStateTransition([domainDocument]);
    domainTransition.sign(identity.getPublicKeyById(0), privateKey);

    await dapiClient.updateState(domainTransition);

    // 6. Wait until domain state transition is confirmed
    await waitWithAttempts(10, async () => dapiClient
      .fetchDocuments(
        dataContract.getId(),
        'domain',
        {
          where: [[
            'nameHash', '==', nameHash,
          ]],
        },
      ));

    return domainDocument;
  }

  return registerMethod;
}

module.exports = registerMethodFactory;
