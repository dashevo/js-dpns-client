const Document = require('@dashevo/dpp/lib/document/Document');

const { hash } = require('../utils/doubleSha256Multihash');

/**
 * Resolve domain by name (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @return {resolveMethod}
 */
function resolveMethodFactory(dapiClient, dpp) {
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
    const normalizedAndHashedName = hash(
      Buffer.from(name.toLowerCase()),
    ).toString('hex');

    const [rawDocument] = await dapiClient.fetchDocuments(
      dpp.getContract().getId(),
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
