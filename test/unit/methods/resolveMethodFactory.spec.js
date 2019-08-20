const Document = require('@dashevo/dpp/lib/document/Document');
const createDataProviderMock = require('../../mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');
const resolveMethodFactory = require('../../../lib/method/resolveMethodFactory');
const createDPPMock = require('../../mocks/createDPPMock');

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

  it('should return function', () => {
    const resolveMethod = resolveMethodFactory(dapiClientMock, dppMock);

    expect(resolveMethod).to.be.instanceOf(Function);
  });

  it('should return a document', async () => {
    const resolveMethod = resolveMethodFactory(dapiClientMock, dppMock);
    const result = await resolveMethod('someName');

    expect(result).to.be.an.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnce();
  });
});
