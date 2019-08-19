const createDocumentTransactionDataFactory = require(
  '../transaction/createDocumentTransactionDataFactory',
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
    const account = wallet.getAccount();

    const address = account.getAddress();
    const [privateKey] = account.getPrivateKeys();

    const createDocumentTransactionData = createDocumentTransactionDataFactory(
      dpp, regTxId, privateKey,
    );

    const nameLabels = name.split('.');

    const normalizedParentDomainName = nameLabels
      .slice(1)
      .join('.')
      .toLowerCase();

    const [label] = nameLabels;
    const normalizedLabel = name.toLowerCase();

    const preorderSalt = address;

    const saltedDomainHash = hash(
      preorderSalt + Buffer.from(name),
    ).toString('hex');

    // 1. Create preorder document
    const preorderDocument = dpp.document.create('preorder', {
      saltedDomainHash,
    });

    const preorderValidationResult = dpp.document.validate(preorderDocument);

    if (!preorderValidationResult.isValid()) {
      throw new Error('Preorder document is not valid');
    }

    const prevSTHash = await dapiClient.getLastUserStateTransitionHash(regTxId);

    // 2. Create and send preorder transaction
    const {
      transaction: preorderTransaction,
      stPacket: preorderSTPacket,
    } = await createDocumentTransactionData(
      preorderDocument,
      prevSTHash,
    );

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

    const domainDocumentValidationResult = dpp.document.validate(domainDocument);

    if (!domainDocumentValidationResult.isValid()) {
      throw new Error('Domain document is not valid');
    }

    // 2. Create and send preorder transaction
    const {
      transaction: domainTransaction,
      stPacket: domainSTPacket,
    } = await createDocumentTransactionData(
      preorderDocument,
      preorderTransitionHash,
    );

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
