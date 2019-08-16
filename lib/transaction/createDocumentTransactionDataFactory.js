const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * Create state transaction transaction data for a document (factory)
 *
 * @param {DashPlatformProtocol} dpp
 * @param {string} regTxId
 * @param {PrivateKey} privateKey
 *
 * @return {createDocumentTransactionData}
 */
function createDocumentTransactionDataFactory(dpp, regTxId, privateKey) {
  /**
   * Create state transition transaction data for a document
   *
   * @typedef createDocumentTransactionData
   *
   * @param {Document} document
   * @param {string|undefined} prevSTHash
   *
   * @return {Promise<{transaction: Transaction, stPacket: STpacket}>}
   */
  async function createDocumentTransactionData(document, prevSTHash = null) {
    const stPacket = dpp.packet.create([document]);

    const transaction = new Transaction()
      .setType(Transaction.TYPES.TRANSACTION_SUBTX_TRANSITION);

    transaction.extraPayload
      .setRegTxId(regTxId)
      .setHashPrevSubTx(prevSTHash || regTxId)
      .setHashSTPacket(stPacket.hash())
      .setCreditFee(1000)
      .sign(privateKey);

    return { transaction, stPacket };
  }

  return createDocumentTransactionData;
}

module.exports = createDocumentTransactionDataFactory;
