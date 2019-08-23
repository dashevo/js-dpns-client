const Document = require('@dashevo/dpp/lib/document/Document');

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
      const result = await dpnsClient.register('name');

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
      const result = await dpnsClient.resolve('someName');

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
      const result = await dpnsClient.resolveByRecord('record', 'value');

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
      const result = await dpnsClient.search('labelPrefix', 'parentDomainName');

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.an.instanceOf(Document);
      expect(result[0]).to.equal(parentDocument);
    });
  });
});
