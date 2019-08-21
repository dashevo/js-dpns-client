const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const createDataProviderMock = require('../../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const searchMethodFactory = require('../../../lib/method/searchMethodFactory');

describe('searchMethodFactory', () => {
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

  it('should return array of documents', async () => {
    const searchMethod = searchMethodFactory(dapiClientMock, dppMock);
    const result = await searchMethod('labelPrefix', 'parentDomainName');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(1);

    expect(result[0]).to.be.instanceOf(Document);
    expect(result[0]).to.deep.include(parentDocument);

    expect(dapiClientMock.fetchDocuments).to.have.been.calledOnceWith(
      dppMock.getContract().getId(),
      'domain',
      {
        where: [
          ['normalizedParentDomainName', '==', 'parentDomainName'.toLowerCase()],
          ['normalizedLabel', 'startWith', 'labelPrefix'],
        ],
      },
    );
  });
});
