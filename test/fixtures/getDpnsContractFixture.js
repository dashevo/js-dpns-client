const dpnsDocuments = require('dpns-contract/src/schema/dpns-documents');
const Contract = require('@dashevo/dpp/lib/contract/Contract');

/**
 * @return {Contract}
 */
module.exports = function getContractFixture() {
  return new Contract('dpnsContract', dpnsDocuments);
};
