const DashPlatformProtocol = require('@dashevo/dpp');

const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const entropy = require('@dashevo/dpp/lib/util/entropy');
const generateRandomId = require('@dashevo/dpp/lib/test/utils/generateRandomId');

const getDpnsContractFixture = require('./getDpnsContractFixture');

const userId = generateRandomId();
const dpp = new DashPlatformProtocol();

/**
 * @return {Document}
 */
function getParentDocumentFixture(options = {}) {
  const dataContract = getDpnsContractFixture();

  const label = options.label || 'Parent';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const fullDomainName = `${normalizedLabel}.grandparent`;

  const data = {
    nameHash: hash(Buffer.from(fullDomainName)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: 'grandparent',
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: userId,
    },
    ...options,
  };

  return dpp.document.create(dataContract, userId, 'domain', data);
}

/**
 * @return {Document}
 */
function getChildDocumentFixture(options = {}) {
  const dataContract = getDpnsContractFixture();

  const label = options.label || 'Child';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();

  const parent = getParentDocumentFixture();
  const parentDomainName = `${parent.getData().normalizedLabel}.${parent.getData().normalizedParentDomainName}`;
  const fullDomainName = `${normalizedLabel}.${parentDomainName}`;

  const data = {
    nameHash: hash(Buffer.from(fullDomainName)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: parentDomainName,
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: userId,
    },
    ...options,
  };

  return dpp.document.create(dataContract, userId, 'domain', data);
}

module.exports = {
  getParentDocumentFixture,
  getChildDocumentFixture,
};
