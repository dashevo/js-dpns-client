const bs58 = require('bs58');

const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');
const getIdentityFixture = require('@dashevo/dpp/lib/test/fixtures/getIdentityFixture');

const { PrivateKey } = require('@dashevo/dashcore-lib');

const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const createWalletMock = require('../../../lib/test/mocks/createWalletMock');

const { getParentDocumentFixture } = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

const registerMethodFactory = require('../../../lib/method/registerMethodFactory');

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

    dapiClientMock.getDocuments
      .resolves([parentDocument.serialize()]);
    dapiClientMock.applyStateTransition = this.sinon.stub();

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

    preorderSalt = bs58.encode(
      Buffer.from('preorderSalt'),
    );

    const entropyMock = {
      generate: () => preorderSalt,
    };

    registerMethod = registerMethodFactory(
      dapiClientMock,
      dppMock,
      walletMock,
      entropyMock,
      dataContract,
    );
  });

  it('should return a document', async () => {
    const name = 'someName';
    const result = await registerMethod(name, identity, {
      dashIdentity: identity.getId(),
    });
    const nameHash = hash(
      Buffer.from(name.toLowerCase()),
    ).toString('hex');

    const saltedDomainHash = '5620417d36ca8defa4179ed4ab12a5e1a9b7a1e20b6a9c4932ef72d362634dd1bb22';

    expect(dppMock.document.create.getCall(0).args).to.deep.equal([
      dataContract,
      identity.getId(),
      'preorder', {
        saltedDomainHash,
      },
    ]);

    expect(dppMock.document.create.getCall(1).args).to.deep.equal([
      dataContract,
      identity.getId(),
      'domain', {
        nameHash,
        label: name,
        normalizedLabel: name.toLowerCase(),
        normalizedParentDomainName: '',
        preorderSalt,
        records: {
          dashIdentity: identity.getId(),
        },
      },
    ]);

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.be.equal(parentDocument);
  });

  it('should throw an error if name is missing', async () => {
    try {
      await registerMethod();

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Invalid argument: name');
    }
  });

  it('should throw an error if user is missing', async () => {
    try {
      await registerMethod('name');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Invalid argument: user');
    }
  });

  it('should throw an error if records is missing', async () => {
    try {
      await registerMethod('name', identity);

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Invalid argument: records');
    }
  });
});
