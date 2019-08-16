const Document = require('@dashevo/dpp/lib/document/Document');

/**
 * Search domains by prefix and parent domain name (factory)
 *
 * @param {DAPIClient} dapiClient
 *
 * @return {searchMethod}
 */
function searchMethodFactory(dapiClient) {
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
      'domain',
      {
        where: [
          [
            ['normalizedParentDomainName', '==', normalizedParentDomainName],
            ['normalizedLabel', 'startWith', labelPrefix],
          ],
        ],
      },
    );

    return rawDocuments.map(rawDocument => new Document(rawDocument));
  }

  return searchMethod;
}

module.exports = searchMethodFactory;
