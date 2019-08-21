const rewiremock = require('rewiremock/node');

const Document = require('@dashevo/dpp/lib/document/Document');

const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const createWalletMock = require('../../../lib/test/mocks/createWalletMock');
const createDPPMock = require('../../../lib/test/mocks/createDPPMock');
const { getParentDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');

describe('registerMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let walletMock;
  let createDocumentTransactionDataMock;
  let registerMethod;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);

    parentDocument = dpnsDocumentFixture.getParentDocumentFixture({ type: 'domain' });

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

    dppMock.packet.validate.returns({
      isValid: this.sinon.stub().returns(true),
    });

    dppMock.document.create.withArgs('preorder').returns(getParentDocumentFixture({ type: 'preorder' }));
    dppMock.document.create.withArgs('domain').returns(parentDocument);

    const serialize = this.sinon.stub().returns('');

    createDocumentTransactionDataMock = this.sinon.stub().resolves({
      transaction: { serialize },
      stPacket: { serialize },
    });

    const registerMethodFactory = rewiremock.proxy('../../../lib/method/registerMethodFactory', {
      '../../../lib/transaction/createDocumentTransactionData': createDocumentTransactionDataMock,
    });

    registerMethod = registerMethodFactory(dapiClientMock, dppMock, walletMock);
  });

  it('should return a document', async () => {
    const result = await registerMethod('someName', '562a795654476351646e34744d576866637979455673317a7476744b3676797a');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });
});
