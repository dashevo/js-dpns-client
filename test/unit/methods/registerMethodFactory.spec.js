const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const { PrivateKey } = require('@dashevo/dashcore-lib');

const registerMethodFactory = require('../../../lib/method/registerMethodFactory');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const createWalletMock = require('../../../lib/test/mocks/createWalletMock');
const { getParentDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');

describe('registerMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let preorderDocument;
  let walletMock;
  let registerMethod;
  let blockchainIdentity;
  let privateKey;
  let prevSTHash;
  let preorderTransitionHash;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);

    parentDocument = dpnsDocumentFixture.getParentDocumentFixture({ type: 'domain' });
    preorderDocument = getParentDocumentFixture({ type: 'preorder' });

    privateKey = new PrivateKey();
    prevSTHash = 'ac5784e7dd8fc9f1b638a353fb10015d3841bb9076c20e2ebefc3e97599e92b5';
    preorderTransitionHash = 'ac5784e7dd8fc9f1b638a353fb10015d3841bb9076c20e2ebefc3e97599e92b5';

    dapiClientMock.fetchDocuments
      .resolves([parentDocument.toJSON()]);
    dapiClientMock.getLastUserStateTransitionHash
      .resolves(prevSTHash);
    dapiClientMock.sendRawTransition
      .resolves(preorderTransitionHash);

    walletMock = createWalletMock(this.sinon);
    walletMock.getAccount.returns({
      getAddress: () => ({ address: 'address' }),
      getPrivateKeys: () => [privateKey],
    });

    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: () => 'someContratId',
    });

    dppMock.packet.validate.returns({
      isValid: () => true,
    });

    dppMock.packet.create.returns({
      hash: () => 'ac5784e7dd8fc9f1b638a353fb10015d3841bb9076c20e2ebefc3e97599e92b5',
      serialize: () => 'ac5784e7dd8fc9f1b638a353fb10015d3841bb9076c20e2ebefc3e97599e92b5',
    });

    dppMock.document.create
      .withArgs('preorder', this.sinon.match.any)
      .returns(preorderDocument);
    dppMock.document.create
      .withArgs('domain', this.sinon.match.any)
      .returns(parentDocument);

    blockchainIdentity = {
      regTxId: 'ac5784e7dd8fc9f1b638a353fb10015d3841bb9076c20e2ebefc3e97599e92b5',
    };

    registerMethod = registerMethodFactory(dapiClientMock, dppMock, walletMock, blockchainIdentity);
  });

  it('should return a document', async () => {
    const name = 'someName';
    const result = await registerMethod(name);
    const nameHash = hash(Buffer.from(name)).toString('hex');

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
