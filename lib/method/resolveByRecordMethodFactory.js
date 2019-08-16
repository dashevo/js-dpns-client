const Document = require('@dashevo/dpp/lib/document/Document');

/**
 * Resolve domain by it's record (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 *
 * @return {resolveByRecordMethod}
 */
function resolveByRecordMethodFactory(dapiClient, dpp) {
  /**
   * Resolve domain by it's record
   *
   * @typedef resolveByRecordMethod
   *
   * @param {string} record
   * @param {*} value
   *
   * @returns {Promise<Document>}
   */
  async function resolveByRecordMethod(record, value) {
    const [rawDocument] = await dapiClient.fetchDocuments(
      dpp.getContract().getId(),
      'domain',
      {
        where: [
          [`record.${record}`, '==', value],
        ],
      },
    );

    if (!rawDocument) {
      throw new Error(`Domain with record '${record}' of value '${value}' was not found`);
    }

    return new Document(rawDocument);
  }

  return resolveByRecordMethod;
}

module.exports = resolveByRecordMethodFactory;
