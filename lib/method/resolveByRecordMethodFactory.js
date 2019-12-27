const InvalidArgumentError = require('../errors/InvalidArgumentError');

/**
 * Resolve domain by it's record (factory)
 *
 * @param {DAPIClient} dapiClient
 * @param {DashPlatformProtocol} dpp
 * @param {DataContract} dataContract
 *
 * @return {resolveByRecordMethod}
 */
function resolveByRecordMethodFactory(dapiClient, dpp, dataContract) {
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
    if (!record) {
      throw new InvalidArgumentError('Invalid argument: record');
    }

    if (!value) {
      throw new InvalidArgumentError('Invalid argument: value');
    }

    const [documentBuffer] = await dapiClient.getDocuments(
      dataContract.getId(),
      'domain',
      {
        where: [
          [`records.${record}`, '==', value],
        ],
      },
    );

    if (!documentBuffer) {
      throw new Error(`Domain with record '${record}' of value '${value}' was not found`);
    }

    return dpp.document.createFromSerialized(documentBuffer, { skipValidation: true });
  }

  return resolveByRecordMethod;
}

module.exports = resolveByRecordMethodFactory;
