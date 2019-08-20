const entropy = require('@dashevo/dpp/lib/util/entropy');

const createDocumentTransactionData = require(
  '../transaction/createDocumentTransactionData',
);

const { hash } = require('../utils/doubleSha256Multihash');
const waitWithAttempts = require('../utils/waitWithAttempts');

/**
 * Register a domain (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {wallet} wallet
 *
 * @return {registerMethod}
 */
function registerMethodFactory(dapiClient, dpp, wallet) {
  /**
   * Register a domain
   *
   * @typedef registerMethod
   *
   * @param {string} name
   * @param {string} regTxId
   *
   * @returns {Promise<Document>}
   */
  async function registerMethod(name, regTxId) {
    dpp.setUserId(regTxId);

    const account = wallet.getAccount();
    const { address } = account.getAddress();
    const [privateKey] = account.getPrivateKeys([address]);

    const nameLabels = name.split('.');

    const normalizedParentDomainName = nameLabels
      .slice(1)
      .join('.')
      .toLowerCase();

    const [label] = nameLabels;
    const normalizedLabel = name.toLowerCase();

    const preorderSalt = entropy.generate();

    const saltedDomainHash = hash(
      Buffer.from(preorderSalt + name),
    ).toString('hex');

    // 1. Create preorder document
    const preorderDocument = dpp.document.create('preorder', {
      saltedDomainHash,
    });

    const prevSTHash = await dapiClient.getLastUserStateTransitionHash(regTxId);

    // 2. Create and send preorder transaction
    const {
      transaction: preorderTransaction,
      stPacket: preorderSTPacket,
    } = await createDocumentTransactionData(
      preorderDocument,
      regTxId,
      privateKey.toString(),
      dpp,
      prevSTHash,
    );

    const preorderValidationResult = dpp.packet.validate(preorderSTPacket);

    if (!preorderValidationResult.isValid()) {
      throw new Error('Preorder packet is not valid');
    }

    const preorderTransitionHash = await dapiClient.sendRawTransition(
      preorderTransaction.serialize(),
      preorderSTPacket.serialize().toString('hex'),
    );

    // 3. Wait until preorder transaction is confirmed
    await waitWithAttempts(10, async () => dapiClient
      .fetchDocuments(
        dpp.getContract().getId(),
        'preorder',
        { where: [['saltedDomainHash', '==', preorderDocument.getData().saltedDomainHash]] },
      ));

    const nameHash = hash(Buffer.from(name)).toString('hex');

    const domainDocument = dpp.document.create('domain', {
      nameHash,
      label,
      normalizedLabel,
      normalizedParentDomainName,
      preorderSalt,
      records: {
        dashIdentity: regTxId,
      },
    });

    // 2. Create and send preorder transaction
    const {
      transaction: domainTransaction,
      stPacket: domainSTPacket,
    } = await createDocumentTransactionData(
      preorderDocument,
      regTxId,
      privateKey,
      dpp,
      preorderTransitionHash,
    );

    const domainValidationResult = dpp.packet.validate(domainSTPacket);

    if (!domainValidationResult.isValid()) {
      throw new Error('Domain packet is not valid');
    }

    await this.dapiClient.sendRawTransition(
      domainTransaction.serialize(),
      domainSTPacket.serialize().toString('hex'),
    );

    await waitWithAttempts(10, async () => dapiClient
      .fetchDocuments(
        this.dpp.getContract().getId(),
        'domain',
        { where: [['nameHash', '==', nameHash]] },
      ));

    return domainDocument;
  }

  return registerMethod;
}

module.exports = registerMethodFactory;
