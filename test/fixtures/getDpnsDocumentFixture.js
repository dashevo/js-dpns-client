const { Transaction, PrivateKey } = require('@dashevo/dashcore-lib');
const DocumentFactory = require('@dashevo/dpp/lib/document/DocumentFactory');
const entropy = require('@dashevo/dpp/lib/util/entropy');
const { hash } = require('../../lib/utils/doubleSha256Multihash');
const getDpnsContractFixture = require('./getDpnsContractFixture');

const transaction = new Transaction().setType(Transaction.TYPES.TRANSACTION_SUBTX_REGISTER);
transaction.extraPayload.setUserName('MyUser').setPubKeyIdFromPrivateKey(new PrivateKey());

const userId = transaction.hash;

/**
 * @return {Document}
 */
function getParentDocumentFixture(options = {}) {
  const contract = getDpnsContractFixture();

  const validateDocumentStub = () => {};

  const factory = new DocumentFactory(
    userId,
    contract,
    validateDocumentStub,
  );

  const label = options.label || 'Parent';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const fullDomainName = `${normalizedLabel}.grandparent`;
  const data = Object.assign({}, {
    nameHash: hash(Buffer.from(fullDomainName)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: 'grandparent',
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: transaction.hash,
    },
  }, options);

  return factory.create('domain', data);
}

/**
 * @return {Document}
 */
function getChildDocumentFixture(options = {}) {
  const contract = getDpnsContractFixture();

  const validateDocumentStub = () => {};

  const factory = new DocumentFactory(
    userId,
    contract,
    validateDocumentStub,
  );

  const label = options.label || 'Child';
  const normalizedLabel = options.normalizedLabel || label.toLowerCase();
  const parent = getParentDocumentFixture();
  const parentDomainName = `${parent.getData().normalizedLabel}.${parent.getData().normalizedParentDomainName}`;
  const fullDomainName = `${normalizedLabel}.${parentDomainName}`;
  const data = Object.assign({}, {
    nameHash: hash(Buffer.from(fullDomainName)).toString('hex'),
    label,
    normalizedLabel,
    normalizedParentDomainName: parentDomainName,
    preorderSalt: entropy.generate(),
    records: {
      dashIdentity: transaction.hash,
    },
  }, options);

  return factory.create('domain', data);
}

module.exports = {
  getParentDocumentFixture,
  getChildDocumentFixture,
};
