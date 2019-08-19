const Document = require('@dashevo/dpp/lib/document/Document');
const createDataProviderMock = require('../../mocks/createDataProviderMock');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');
const resolveByRecordMethodFactory = require('../../../lib/method/resolveByRecordMethodFactory');
const getContractFixture = require('../../fixtures/getContractFixture');

describe('resolveByRecordMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;

  beforeEach(function beforeEach() {
    dapiClientMock = createDataProviderMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);

    dppMock = {
      getContract: getContractFixture,
    };
  });

  it('should return function', () => {
    const resolveByRecord = resolveByRecordMethodFactory(dapiClientMock, dppMock);

    expect(resolveByRecord).to.be.instanceOf(Function);
  });

  it('should return a document', async () => {
    const resolveByRecord = resolveByRecordMethodFactory(dapiClientMock, dppMock);
    const result = await resolveByRecord('someName');

    expect(result).to.be.an.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnce();
  });
});
