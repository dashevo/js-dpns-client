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

    DPNSClient = rewiremock.proxy('../../lib/DPNSClient', {
      '../../lib/method/registerMethodFactory': this.sinon.stub().returns(this.sinon.stub().resolves(parentDocument)),
      '../../lib/method/resolveMethodFactory': this.sinon.stub().returns(this.sinon.stub().resolves(parentDocument)),
      '../../lib/method/resolveByRecordMethodFactory': this.sinon.stub().returns(this.sinon.stub().resolves(parentDocument)),
      '../../lib/method/searchMethodFactory': this.sinon.stub().returns(this.sinon.stub().resolves([parentDocument])),
    });
  });

  it('should throw an error if params are invalid for register method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);
    let error;

    try {
      await dpnsClient.register('', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);

    try {
      await dpnsClient.register('name', '');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);
  });

  it('should return a document from register method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);
    const result = await dpnsClient.register('name', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });

  it('should throw an error if params are invalid for resolve method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);
    let error;

    try {
      await dpnsClient.resolve('');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);
  });

  it('should return a document from resolve method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);

    const result = await dpnsClient.resolve('someName');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });

  it('should throw an error if params are invalid for resolveByRecord method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);
    let error;

    try {
      await dpnsClient.resolveByRecord('', 'value');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);

    try {
      await dpnsClient.resolveByRecord('record', '');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);
  });

  it('should return a document from resolveByRecord method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);

    const result = await dpnsClient.resolveByRecord('record', 'value');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });

  it('should throw an error if params are invalid for search method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);
    let error;

    try {
      await dpnsClient.search('', 'parentDomainName');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);

    try {
      await dpnsClient.resolveByRecord('labelPrefix', '');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(InvalidArgumentError);
  });

  it('should return an array of documents from search method', async () => {
    const dpnsClient = new DPNSClient(dapiClientMock, walletMock);

    const result = await dpnsClient.search('labelPrefix', 'parentDomainName');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.be.an.instanceOf(Document);
    expect(result[0]).to.be.equal(parentDocument);
  });
});
