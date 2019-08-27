const Document = require('@dashevo/dpp/lib/document/Document');

/**
 * Search domains by prefix and parent domain name (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @return {searchMethod}
 */
function searchMethodFactory(dapiClient, dpp) {
  /**
   * Search domains by prefix and parent domain name
   *
   * @typedef searchMethod
   *
   * @param {string} labelPrefix
   * @param {string} parentDomainName
   *
   * @returns {Promise<Document[]>}
   */
  async function searchMethod(labelPrefix, parentDomainName) {
    const normalizedParentDomainName = parentDomainName.toLowerCase();

    const rawDocuments = await dapiClient.fetchDocuments(
      dpp.getContract().getId(),
      'domain',
      {
        where: [
          ['normalizedParentDomainName', '==', normalizedParentDomainName],
          ['normalizedLabel', 'startWith', labelPrefix],
        ],
      },
    );

    return rawDocuments.map(rawDocument => new Document(rawDocument));
  }

  return searchMethod;
}

module.exports = searchMethodFactory;
