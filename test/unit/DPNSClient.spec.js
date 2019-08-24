const Document = require('@dashevo/dpp/lib/document/Document');
const Contract = require('@dashevo/dpp/lib/contract/Contract');

const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');

const DPNSClient = require('../../lib/DPNSClient');

const dpnsDocumentFixture = require('../../lib/test/fixtures/getDpnsDocumentFixture');
const InvalidArgumentError = require('../../lib/errors/InvalidArgumentError');

describe('DPNSClient', () => {
  let parentDocument;
  let dpnsClient;

  beforeEach(function beforeEach() {
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();

    dpnsClient = new DPNSClient(null, null, null);
    dpnsClient.registerMethod = this.sinon.stub().resolves(parentDocument);
    dpnsClient.resolveMethod = this.sinon.stub().resolves(parentDocument);
    dpnsClient.resolveByRecordMethod = this.sinon.stub().resolves(parentDocument);
    dpnsClient.searchMethod = this.sinon.stub().resolves([parentDocument]);
  });

  describe('#constructor', () => {
    it('should set arguments correctly', () => {
      const dapiClient = { name: 'dapiClient' };
      const wallet = { name: 'wallet' };
      const blockchainIdentity = { name: 'blockchainIdentity' };

      dpnsClient = new DPNSClient(dapiClient, wallet, blockchainIdentity);

      expect(dpnsClient.dapiClient).to.deep.equal(dapiClient);
      expect(dpnsClient.wallet).to.deep.equal(wallet);
      expect(dpnsClient.dpp.getContract()).to.deep.equal(
        new Contract('dpnsContract', dpnsDocuments),
      );
    });
  });

  describe('#register', () => {
    it('should throw an error if `name` is not specified', async () => {
      try {
        await dpnsClient.register('');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: name');
      }
    });

    it('should return a document', async () => {
      const name = 'name';

      const result = await dpnsClient.register(name);

      expect(dpnsClient.registerMethod).to.have.been.calledWith(name);

      expect(result).to.be.an.instanceOf(Document);
      expect(result).to.equal(parentDocument);
    });
  });

  describe('#resolve', () => {
    it('should throw an error if `name` argument is missing', async () => {
      try {
        await dpnsClient.resolve('');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: name');
      }
    });

    it('should return a document', async () => {
      const name = 'someName';

      const result = await dpnsClient.resolve(name);

      expect(dpnsClient.resolveMethod).to.have.been.calledWith(name);

      expect(result).to.be.an.instanceOf(Document);
      expect(result).to.be.equal(parentDocument);
    });
  });

  describe('#resolveByRecord', () => {
    it('should throw an error if `record` parameter is missing', async () => {
      try {
        await dpnsClient.resolveByRecord('', 'value');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: record');
      }
    });

    it('should throw an error if `value` parameter is missing', async () => {
      try {
        await dpnsClient.resolveByRecord('record', '');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: value');
      }
    });

    it('should return a document', async () => {
      const recordName = 'record';
      const recordValue = 'value';

      const result = await dpnsClient.resolveByRecord(recordName, recordValue);

      expect(dpnsClient.resolveByRecordMethod).to.have.been.calledWith(
        recordName, recordValue,
      );

      expect(result).to.be.an.instanceOf(Document);
      expect(result).to.equal(parentDocument);
    });
  });

  describe('#search', () => {
    it('should throw an error if `labelPrefix` parameter is missing', async () => {
      try {
        await dpnsClient.search('', 'parentDomainName');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: labelPrefix');
      }
    });

    it('should throw an error if `parentDomainName` parameter is missing', async () => {
      try {
        await dpnsClient.search('labelPrefix', '');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: parentDomainName');
      }
    });

    it('should return an array of documents', async () => {
      const labelPrefix = 'labelPrefix';
      const parentDomainName = 'parentDomainName';

      const result = await dpnsClient.search(labelPrefix, parentDomainName);

      expect(dpnsClient.searchMethod).to.have.been.calledWith(
        labelPrefix, parentDomainName,
      );

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.an.instanceOf(Document);
      expect(result[0]).to.equal(parentDocument);
    });
  });
});
