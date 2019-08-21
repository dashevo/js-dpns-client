const rewiremock = require('rewiremock/node');
const Document = require('@dashevo/dpp/lib/document/Document');
const createDapiClientMock = require('../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../lib/test/fixtures/getDpnsDocumentFixture');
const createWalletMock = require('../../lib/test/mocks/createWalletMock');
const InvalidArgumentError = require('../../lib/errors/InvalidArgumentError');

describe('DPNSClient', () => {
  let dapiClientMock;
  let parentDocument;
  let walletMock;
  let DPNSClient;

  let registerMethodMock;
  let resolveMethodMock;
  let resolveByRecordMethodMock;
  let searchMethodMock;

  let dpnsClient;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);

    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();

    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);
    dapiClientMock.getLastUserStateTransitionHash.resolves('562a795654476351646e34744d576866637979455673317a7476744b3676797a');

    walletMock = createWalletMock(this.sinon);
    walletMock.getAccount.returns({
      getAddress: this.sinon.stub().returns({ address: 'address' }),
      getPrivateKeys: this.sinon.stub().returns(['privateKey']),
    });

    registerMethodMock = this.sinon.stub().resolves(parentDocument);
    resolveMethodMock = this.sinon.stub().resolves(parentDocument);
    resolveByRecordMethodMock = this.sinon.stub().resolves(parentDocument);
    searchMethodMock = this.sinon.stub().resolves([parentDocument]);

    DPNSClient = rewiremock.proxy('../../lib/DPNSClient', {
      '../../lib/method/registerMethodFactory': this.sinon.stub().returns(registerMethodMock),
      '../../lib/method/resolveMethodFactory': this.sinon.stub().returns(resolveMethodMock),
      '../../lib/method/resolveByRecordMethodFactory': this.sinon.stub().returns(resolveByRecordMethodMock),
      '../../lib/method/searchMethodFactory': this.sinon.stub().returns(searchMethodMock),
    });

    dpnsClient = new DPNSClient(dapiClientMock, walletMock);
  });

  describe('#register', () => {
    it('should throw an error if `name` is not specified', async () => {
      try {
        await dpnsClient.register('', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');

        expect.fail('Error has not been thrown');
      } catch (e) {
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.message).to.equal('Invalid argument: name');
      }
    });

    it('should return a document', async () => {
      const result = await dpnsClient.register('name', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');

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
