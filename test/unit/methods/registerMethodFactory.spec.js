const rewiremock = require('rewiremock/node');

const Document = require('@dashevo/dpp/lib/document/Document');

const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const createWalletMock = require('../../../lib/test/mocks/createWalletMock');
const createDPPMock = require('../../../lib/test/mocks/createDPPMock');
const { getParentDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const { hash } = require('../../../lib/utils/doubleSha256Multihash');

describe('registerMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let preorderDocument;
  let walletMock;
  let createDocumentTransactionDataMock;
  let registerMethod;
  let bUser;
  let privateKey;
  let prevSTHash;
  let preorderTransitionHash;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);

    parentDocument = dpnsDocumentFixture.getParentDocumentFixture({ type: 'domain' });
    preorderDocument = getParentDocumentFixture({ type: 'preorder' });

    privateKey = 'privateKey';
    prevSTHash = 'prevSTHash';
    preorderTransitionHash = 'preorderTransitionHash';

    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);
    dapiClientMock.getLastUserStateTransitionHash.resolves(prevSTHash);
    dapiClientMock.sendRawTransition.resolves(preorderTransitionHash);

    walletMock = createWalletMock(this.sinon);
    walletMock.getAccount.returns({
      getAddress: this.sinon.stub().returns({ address: 'address' }),
      getPrivateKeys: this.sinon.stub().returns([privateKey]),
    });

    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: this.sinon.stub(),
    });

    dppMock.packet.validate.returns({
      isValid: this.sinon.stub().returns(true),
    });

    dppMock.document.create.withArgs('preorder').returns(preorderDocument);
    dppMock.document.create.withArgs('domain').returns(parentDocument);

    const serialize = this.sinon.stub().returns('');

    createDocumentTransactionDataMock = this.sinon.stub().resolves({
      transaction: { serialize },
      stPacket: { serialize },
    });

    const registerMethodFactory = rewiremock.proxy('../../../lib/method/registerMethodFactory', {
      '../../../lib/transaction/createDocumentTransactionData': createDocumentTransactionDataMock,
    });

    bUser = {
      regTxId: 'someRegTxId',
    };

    registerMethod = registerMethodFactory(dapiClientMock, dppMock, walletMock, bUser);
  });

  it('should return a document', async () => {
    const name = 'someName';
    const result = await registerMethod(name);
    const nameHash = hash(Buffer.from(name)).toString('hex');

    expect(createDocumentTransactionDataMock).to.have.been.calledTwice();
    expect(createDocumentTransactionDataMock.getCall(0)).to.have.been.calledWith(
      preorderDocument,
      bUser.regTxId,
      privateKey,
      dppMock,
      prevSTHash,
    );

    expect(createDocumentTransactionDataMock.getCall(1)).to.have.been.calledWith(
      preorderDocument,
      bUser.regTxId,
      privateKey,
      dppMock,
      preorderTransitionHash,
    );

    expect(dapiClientMock.fetchDocuments).to.have.been.calledTwice();
    expect(dapiClientMock.fetchDocuments.getCall(0)).to.have.been.calledWith(
      dppMock.getContract().getId(),
      'preorder',
      { where: [['saltedDomainHash', '==', preorderDocument.getData().saltedDomainHash]] },
    );
    expect(dapiClientMock.fetchDocuments.getCall(1)).to.have.been.calledWith(
      dppMock.getContract().getId(),
      'domain',
      { where: [['nameHash', '==', nameHash]] },
    );

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });

  it('should throw an error if `preorder` packet is invalid', async () => {
    dppMock.packet.validate.onCall(0).returns({
      isValid: () => false,
    });

    try {
      await registerMethod('someName');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e.message).to.equal('Preorder packet is not valid');
    }
  });

  it('should throw an error if `domain` packet is invalid', async () => {
    dppMock.packet.validate.onCall(1).returns({
      isValid: () => false,
    });

    try {
      await registerMethod('someName');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e.message).to.equal('Domain packet is not valid');
    }
  });
});
