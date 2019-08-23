const entropy = require('@dashevo/dpp/lib/util/entropy');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const { Transaction } = require('@dashevo/dashcore-lib');

const waitWithAttempts = require('../utils/waitWithAttempts');

/**
 * Register a domain (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {Wallet} wallet
 * @param {BlockchainIdentity} blockchainIdentity
 *
 * @return {registerMethod}
 */
function registerMethodFactory(dapiClient, dpp, wallet, blockchainIdentity) {
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
    dpp.setUserId(blockchainIdentity.regTxId);

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

    const prevSTHash = await dapiClient.getLastUserStateTransitionHash(
      blockchainIdentity.regTxId,
    );

    // 2. Create and send preorder transaction
    const preorderSTPacket = dpp.packet.create([preorderDocument]);

    const preorderTransaction = new Transaction()
      .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

    preorderTransaction.extraPayload
      .setRegTxId(blockchainIdentity.regTxId)
      .setHashPrevSubTx(prevSTHash)
      .setHashSTPacket(preorderSTPacket.hash())
      .setCreditFee(1000)
      .sign(privateKey);

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
        dashIdentity: blockchainIdentity.regTxId,
      },
    });

    // 2. Create and send preorder transaction
    const domainSTPacket = dpp.packet.create([preorderDocument]);

    const domainTransaction = new Transaction()
      .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

    domainTransaction.extraPayload
      .setRegTxId(blockchainIdentity.regTxId)
      .setHashPrevSubTx(preorderTransitionHash)
      .setHashSTPacket(domainSTPacket.hash())
      .setCreditFee(1000)
      .sign(privateKey);

    const domainValidationResult = dpp.packet.validate(domainSTPacket);

    if (!domainValidationResult.isValid()) {
      throw new Error('Domain packet is not valid');
    }

    await dapiClient.sendRawTransition(
      domainTransaction.serialize(),
      domainSTPacket.serialize().toString('hex'),
    );

    await waitWithAttempts(10, async () => dapiClient
      .fetchDocuments(
        dpp.getContract().getId(),
        'domain',
        { where: [['nameHash', '==', nameHash]] },
      ));

    return domainDocument;
  }

  return registerMethod;
}

module.exports = registerMethodFactory;
