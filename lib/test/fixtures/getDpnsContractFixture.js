const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');
const Contract = require('@dashevo/dpp/lib/contract/Contract');

/**
 * @return {Contract}
 */
module.exports = function getDpnsContractFixture() {
  return new Contract('dpnsContract', dpnsDocuments);
};