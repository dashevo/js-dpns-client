const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');
const { hash } = require('@dashevo/dpp/lib/util/multihashDoubleSHA256');

const createDataProviderMock = require('../../../lib/test/mocks/createDapiClientMock');

const getDpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

const resolveMethodFactory = require('../../../lib/method/resolveMethodFactory');

describe('resolveMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let dataContract;
  let resolveMethod;

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = getDpnsDocumentFixture.getParentDocumentFixture();
    dataContract = getDpnsContractFixture();
    dapiClientMock.getDocuments
      .resolves([parentDocument.serialize()]);

    dppMock = createDPPMock(this.sinon);
    dppMock.document.createFromSerialized.returns(parentDocument);

    resolveMethod = resolveMethodFactory(dapiClientMock, dppMock, dataContract);
  });

  it('should return a document', async () => {
    const name = 'name';
    const result = await resolveMethod(name);

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.deep.equal(parentDocument);

    expect(dapiClientMock.getDocuments).to.have.been.calledOnceWith(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['nameHash', '==', hash(Buffer.from(name.toLowerCase())).toString('hex')],
        ],
      },
    );

    expect(dppMock.document.createFromSerialized).to.have.been.calledOnceWithExactly(
      parentDocument.serialize(),
      { skipValidation: true },
    );
  });

  it('should throw an error if no documents found', async () => {
    dapiClientMock.getDocuments.resolves([]);

    try {
      await resolveMethod('name');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Domain \'name\' was not found');
    }
  });
});
