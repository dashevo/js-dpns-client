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

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);
    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: this.sinon.stub(),
    });
  });

  it('should return a document', async () => {
    const resolveMethod = resolveMethodFactory(dapiClientMock, dppMock);
    const name = 'name';
    const result = await resolveMethod(name);

    expect(result).to.be.an.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnceWith(
      dppMock.getContract().getId(),
      'domain',
      {
        where: [
          ['nameHash', '==', hash(Buffer.from(name.toLowerCase())).toString('hex')],
        ],
      },
    );
    expect(result).to.deep.include(parentDocument);
  });

  it('should throw an error if no documents found', async () => {
    const resolveByRecord = resolveMethodFactory(dapiClientMock, dppMock);
    let error;

    dapiClientMock.fetchDocuments.resolves([]);

    try {
      await resolveByRecord('name');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(Error);
  });
});
