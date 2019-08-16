const Document = require('@dashevo/dpp/lib/document/Document');

const multihash = require('../utils/multihash');

/**
 * Resolve domain by name (factory)
 *
 * @param {DAPIClient} dapiClient
 *
 * @return {resolveMethod}
 */
function resolveMethodFactory(dapiClient) {
  /**
   * Resolve domain by name
   *
   * @typedef resolveMethod
   *
   * @param {string} name
   *
   * @returns {Promise<Document>}
   */
  async function resolveMethod(name) {
    const normalizedAndHashedName = multihash(
      Buffer.from(name.toLowerCase()),
    ).toString('hex');

    const [rawDocument] = await dapiClient.fetchDocuments(
      'domain',
      {
        where: [
          ['nameHash', '==', normalizedAndHashedName],
        ],
      },
    );

    if (!rawDocument) {
      throw new Error(`Domain '${name}' was not found`);
    }

    return new Document(rawDocument);
  }

  return resolveMethod;
}

module.exports = resolveMethodFactory;
