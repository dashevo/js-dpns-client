const Document = require('@dashevo/dpp/lib/document/Document');
const createDataProviderMock = require('../../mocks/createDataProviderMock');
const searchMethodFactory = require('../../../lib/method/searchMethodFactory');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');

describe('searchMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);

    // @TODO fix me
    dppMock = {
      getContract: this.sinon.stub().returns({
        getId: this.sinon.stub().returns(1),
      }),
    };
  });

  it('', async () => {
    const searchMethod = searchMethodFactory(dapiClientMock, dppMock);

    expect(searchMethod).to.be.instanceOf(Function);

    const result = await searchMethod('labelPrefix', 'parentDomainName');
    expect(result).to.be.an.instanceOf(Array);
    expect(result.length).to.be.equal(1);

    expect(result[0]).to.be.instanceOf(Document);

    expect(dapiClientMock.fetchDocuments).to.be.calledOnce();
    // expect(dapiClientMock.fetchDocuments).to.be.calledOnceWith(
    //   dppMock.getContract().getId(),
    //   'domain',
    //   {
    //     where: [
    //       [
    //         ['normalizedParentDomainName', '==', 'labelPrefix'],
    //         ['normalizedLabel', 'startWith', 'parentDomainName'],
    //       ],
    //     ],
    //   }
    // );
  });
});
