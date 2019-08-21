const Document = require('@dashevo/dpp/lib/document/Document');
const createDataProviderMock = require('../../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const resolveMethodFactory = require('../../../lib/method/resolveMethodFactory');
const createDPPMock = require('../../../lib/test/mocks/createDPPMock');
const { hash } = require('../../../lib/utils/doubleSha256Multihash');

describe('resolveMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let resolveMethod;

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);

    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: this.sinon.stub(),
    });

    resolveMethod = resolveMethodFactory(dapiClientMock, dppMock);
  });

  it('should return a document', async () => {
    const name = 'name';
    const result = await resolveMethod(name);

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.deep.equal(parentDocument);

    expect(dapiClientMock.fetchDocuments).to.have.been.calledOnceWith(
      dppMock.getContract().getId(),
      'domain',
      {
        where: [
          ['nameHash', '==', hash(Buffer.from(name.toLowerCase())).toString('hex')],
        ],
      },
    );
  });

  it('should throw an error if no documents found', async () => {
    dapiClientMock.fetchDocuments.resolves([]);

    try {
      await resolveMethod('name');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Domain \'name\' was not found');
    }
  });
});
