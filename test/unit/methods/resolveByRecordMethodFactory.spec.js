const Document = require('@dashevo/dpp/lib/document/Document');
const createDapiClientMock = require('../../mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../fixtures/getDpnsDocumentFixture');
const resolveByRecordMethodFactory = require('../../../lib/method/resolveByRecordMethodFactory');
const createDPPMock = require('../../mocks/createDPPMock');

describe('resolveByRecordMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments.resolves([parentDocument.toJSON()]);
    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: this.sinon.stub(),
    });
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
