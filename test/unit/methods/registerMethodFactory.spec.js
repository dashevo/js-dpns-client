const rewiremock = require('rewiremock/node');
const Document = require('@dashevo/dpp/lib/document/Document');
const registerMethodFactory = require('../../../lib/method/registerMethodFactory');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');
const createDapiClientMock = require('../../mocks/createDapiClientMock');
const createWalletMock = require('../../mocks/createWalletMock');
const createDPPMock = require('../../mocks/createDPPMock');

describe('registerMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let walletMock;
  let createDocumentTransactionDataMock;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);
    walletMock = createWalletMock(this.sinon);
    walletMock.getAccount.returns({
      getAddress: this.sinon.stub().returns({ address: 'address' }),
      getPrivateKeys: this.sinon.stub().returns(['privateKey']),
    });
    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: this.sinon.stub(),
    });
    const serialize = this.sinon.stub();

    createDocumentTransactionDataMock = this.sinon.stub().resolves({
      transaction: { serialize },
      stPacket: { serialize },
    });
    rewiremock.proxy('../../../lib/method/registerMethodFactory', {
      '../../../lib/transaction/createDocumentTransactionData': createDocumentTransactionDataMock,
    });
  });

  it('should return function', () => {
    const registerMethod = registerMethodFactory(dapiClientMock, dppMock, walletMock);

    expect(registerMethod).to.be.instanceOf(Function);
  });

  it('should return a document', async () => {
    const registerMethod = registerMethodFactory(dapiClientMock, dppMock, walletMock);

    const result = await registerMethod('someName', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');
    expect(result).to.be.an.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnce();
  });
});
