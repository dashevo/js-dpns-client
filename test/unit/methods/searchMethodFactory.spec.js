const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const createDataProviderMock = require('../../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const searchMethodFactory = require('../../../lib/method/searchMethodFactory');

const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

describe('searchMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let searchMethod;
  let dataContract;

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.getDocuments
      .resolves([parentDocument.serialize()]);

    dppMock = createDPPMock(this.sinon);
    dppMock.document.createFromSerialized.returns(parentDocument);

    dataContract = getDpnsContractFixture();

    searchMethod = searchMethodFactory(dapiClientMock, dppMock, dataContract);
  });

  it('should return array of documents', async () => {
    const result = await searchMethod('labelPrefix', 'parentDomainName');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(1);

    expect(result[0]).to.be.instanceOf(Document);
    expect(result[0]).to.deep.include(parentDocument);

    expect(dapiClientMock.getDocuments).to.have.been.calledOnceWithExactly(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['normalizedParentDomainName', '==', 'parentDomainName'.toLowerCase()],
          ['normalizedLabel', 'startsWith', 'labelPrefix'],
        ],
      },
    );

    expect(dppMock.document.createFromSerialized).to.have.been.calledOnceWithExactly(
      parentDocument.serialize(),
      { skipValidation: true },
    );
  });
});
