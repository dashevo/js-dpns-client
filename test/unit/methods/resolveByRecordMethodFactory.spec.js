const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');
const dpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const resolveByRecordMethodFactory = require('../../../lib/method/resolveByRecordMethodFactory');

describe('resolveByRecordMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let resolveByRecordMethod;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);
    parentDocument = dpnsDocumentFixture.getParentDocumentFixture();
    dapiClientMock.fetchDocuments
      .resolves([parentDocument.toJSON()]);

    dppMock = createDPPMock(this.sinon);
    dppMock.getContract.returns({
      getId: () => 'someContractId',
    });

    resolveByRecordMethod = resolveByRecordMethodFactory(dapiClientMock, dppMock);
  });

  it('should return a document', async () => {
    const result = await resolveByRecordMethod('name', 'value');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.deep.equal(parentDocument);

    expect(dapiClientMock.fetchDocuments).to.have.been.calledOnceWith(
      dppMock.getContract().getId(),
      'domain',
      {
        where: [
          ['record.name', '==', 'value'],
        ],
      },
    );
  });

  it('should throw an error if no documents found', async () => {
    dapiClientMock.fetchDocuments.resolves([]);

    try {
      await resolveByRecordMethod('name', 'value');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Domain with record \'name\' of value \'value\' was not found');
    }
  });
});
