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
  async function searchMethod(labelPrefix, parentDomainName = '') {
    if (!labelPrefix) {
      throw new InvalidArgumentError('Invalid argument: labelPrefix');
    }

    if (parentDomainName === undefined) {
      throw new InvalidArgumentError('Invalid argument: parentDomainName');
    }

    const normalizedParentDomainName = parentDomainName.toLowerCase();

    const documentBuffers = await dapiClient.getDocuments(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['normalizedParentDomainName', '==', normalizedParentDomainName],
          ['normalizedLabel', 'startsWith', labelPrefix],
        ],
      },
    );

    return Promise.all(
      documentBuffers.map(async (documentBuffer) => (
        dpp.document.createFromSerialized(documentBuffer, { skipValidation: true })
      )),
    );
  }

  return searchMethod;
}

module.exports = searchMethodFactory;
