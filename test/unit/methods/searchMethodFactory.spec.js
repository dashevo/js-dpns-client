const Document = require('@dashevo/dpp/lib/document/Document');
const createDataProviderMock = require('../../mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');
const searchMethodFactory = require('../../../lib/method/searchMethodFactory');
const createDPPMock = require('../../mocks/createDPPMock');

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

  it('should return function', () => {
    const searchMethod = searchMethodFactory(dapiClientMock, dppMock);

    expect(searchMethod).to.be.instanceOf(Function);
  });

  it('should return array of documents', async () => {
    const searchMethod = searchMethodFactory(dapiClientMock, dppMock);
    const result = await searchMethod('labelPrefix', 'parentDomainName');

    expect(result).to.be.an.instanceOf(Array);
    expect(result.length).to.be.equal(1);
    expect(result[0]).to.be.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnceWith(
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
