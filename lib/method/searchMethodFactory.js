const InvalidArgumentError = require('../errors/InvalidArgumentError');

/**
 * Search domains by prefix and parent domain name (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {DataContract} dataContract
 *
 * @return {searchMethod}
 */
function searchMethodFactory(dapiClient, dpp, dataContract) {
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
    if (!labelPrefix) {
      throw new InvalidArgumentError('Invalid argument: labelPrefix');
    }

    if (!parentDomainName) {
      throw new InvalidArgumentError('Invalid argument: parentDomainName');
    }

    const normalizedParentDomainName = parentDomainName.toLowerCase();

    const rawDocuments = await dapiClient.fetchDocuments(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['normalizedParentDomainName', '==', normalizedParentDomainName],
          ['normalizedLabel', 'startWith', labelPrefix],
        ],
      },
    );

    return rawDocuments.map((rawDocument) => dpp.document.createFromObject(rawDocument));
  }

  return searchMethod;
}

module.exports = searchMethodFactory;
