const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');
const DashPlatformProtocol = require('@dashevo/dpp');

/**
 * @return {DataContract}
 */
module.exports = function getDpnsContractFixture() {
  const dpp = new DashPlatformProtocol();

  return dpp.dataContract.create('dpnsContract', dpnsDocuments);
};
