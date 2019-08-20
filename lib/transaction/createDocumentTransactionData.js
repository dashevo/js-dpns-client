const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * Create state transition transaction data for a document
 *
 * @typedef createDocumentTransactionData
 *
 * @param {Document} document
 * @param {string} regTxId
 * @param {PrivateKey} privateKey
 * @param {DashPlatformProtocol} dpp
 * @param {string|undefined} prevSTHash
 *
 * @return {Promise<{transaction: Transaction, stPacket: STpacket}>}
 */
async function createDocumentTransactionData(
  document, regTxId, privateKey, dpp, prevSTHash = null,
) {
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

module.exports = createDocumentTransactionData;
