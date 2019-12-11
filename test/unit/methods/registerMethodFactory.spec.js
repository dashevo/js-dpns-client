const rewiremock = require('rewiremock/node');

const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const getIdentityFixture = require('@dashevo/dpp/lib/test/fixtures/getIdentityFixture');

const { PrivateKey } = require('@dashevo/dashcore-lib');

const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const createWalletMock = require('../../../lib/test/mocks/createWalletMock');

const { getParentDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

describe('registerMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let walletMock;
  let registerMethod;
  let identity;
  let dataContract;
  let privateKey;
  let preorderSalt;

  beforeEach(function beforeEach() {
    dataContract = getDpnsContractFixture();
    identity = getIdentityFixture();

    dapiClientMock = createDapiClientMock(this.sinon);

    parentDocument = getParentDocumentFixture({ type: 'domain' });

    privateKey = new PrivateKey();

    dapiClientMock.fetchDocuments
      .resolves([parentDocument.toJSON()]);
    dapiClientMock.updateState = this.sinon.stub();

    walletMock = createWalletMock(this.sinon);
    walletMock.getAccount.returns({
      getIdentityPrivateKey: () => privateKey,
    });

    const preorderDocumentMock = {
      type: 'preorder',
    };

    dppMock = createDPPMock(this.sinon);

    dppMock.document.create
      .withArgs(
        dataContract,
        identity.getId(),
        'preorder',
        this.sinon.match.any,
      )
      .returns(preorderDocumentMock);

    dppMock.document.create
      .withArgs(
        dataContract,
        identity.getId(),
        'domain',
        this.sinon.match.any,
      )
      .returns(parentDocument);

    dppMock.document.createStateTransition = this.sinon.stub();

    dppMock.document.createStateTransition
      .withArgs([preorderDocumentMock])
      .returns({
        sign: this.sinon.stub(),
      });

    dppMock.document.createStateTransition
      .withArgs([parentDocument])
      .returns({
        sign: this.sinon.stub(),
      });

    dppMock.document.createFromObject.returns(parentDocument);

    preorderSalt = 'preorderSalt';

    const entropyMock = {
      generate: () => preorderSalt,
    };

    const registerMethodFactory = rewiremock.proxy(
      '../../../lib/method/registerMethodFactory',
      {
        '../../../node_modules/@dashevo/dpp/lib/util/entropy': entropyMock,
      },
    );

    registerMethod = registerMethodFactory(
      dapiClientMock,
      dppMock,
      walletMock,
      identity,
      dataContract,
    );
  });

  it('should return a document', async () => {
    const name = 'someName';
    const result = await registerMethod(name);
    const nameHash = hash(Buffer.from(name)).toString('hex');

    const saltedDomainHash = '56147072656f7264657253616c74736f6d654e616d65';

    expect(dapiClientMock.fetchDocuments).to.have.been.calledTwice();
    expect(dapiClientMock.fetchDocuments.getCall(0)).to.have.been.calledWith(
      dataContract.getId(),
      'preorder',
      { where: [['saltedDomainHash', '==', saltedDomainHash]] },
    );
    expect(dapiClientMock.fetchDocuments.getCall(1)).to.have.been.calledWith(
      dataContract.getId(),
      'domain',
      { where: [['nameHash', '==', nameHash]] },
    );

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });
});
