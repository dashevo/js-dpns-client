const Document = require('@dashevo/dpp/lib/document/Document');
const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const resolveByRecordMethodFactory = require('../../../lib/method/resolveByRecordMethodFactory');
const createDPPMock = require('../../../lib/test/mocks/createDPPMock');

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

  it('should return a document', async () => {
    const resolveByRecord = resolveByRecordMethodFactory(dapiClientMock, dppMock);
    const result = await resolveByRecord('name', 'value');

    expect(result).to.be.an.instanceOf(Document);
    expect(dapiClientMock.fetchDocuments).to.be.calledOnceWith(
      dppMock.getContract().getId(),
      'domain',
      {
        where: [
          ['record.name', '==', 'value'],
        ],
      },
    );

    expect(result).to.deep.include(parentDocument);
  });

  it('should throw an error if no documents found', async () => {
    const resolveByRecord = resolveByRecordMethodFactory(dapiClientMock, dppMock);
    let error;

    dapiClientMock.fetchDocuments.resolves([]);

    try {
      await resolveByRecord('name', 'value');
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(Error);
  });
});
