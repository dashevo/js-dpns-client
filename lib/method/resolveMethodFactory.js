const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');

const InvalidArgumentError = require('../errors/InvalidArgumentError');

/**
 * Resolve domain by name (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {DataContract} dataContract
 *
 * @return {resolveMethod}
 */
function resolveMethodFactory(dapiClient, dpp, dataContract) {
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
    if (!name) {
      throw new InvalidArgumentError('Invalid argument: name');
    }

    const normalizedAndHashedName = hash(
      Buffer.from(name.toLowerCase()),
    ).toString('hex');

    const [documentBuffer] = await dapiClient.getDocuments(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['nameHash', '==', normalizedAndHashedName],
        ],
      },
    );

    if (!documentBuffer) {
      throw new Error(`Domain '${name}' was not found`);
    }

    return dpp.document.createFromSerialized(documentBuffer, { skipValidation: true });
  }

  return resolveMethod;
}

module.exports = resolveMethodFactory;
