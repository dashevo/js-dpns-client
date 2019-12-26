const Document = require('@dashevo/dpp/lib/document/Document');
const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const createDapiClientMock = require('../../../lib/test/mocks/createDapiClientMock');

const getDpnsDocumentFixture = require('../../../lib/test/fixtures/getDpnsDocumentFixture');
const getDpnsContractFixture = require('../../../lib/test/fixtures/getDpnsContractFixture');

const resolveByRecordMethodFactory = require('../../../lib/method/resolveByRecordMethodFactory');

describe('resolveByRecordMethodFactory', () => {
  let dapiClientMock;
  let dppMock;
  let parentDocument;
  let dataContract;
  let resolveByRecordMethod;

  beforeEach(function beforeEach() {
    dapiClientMock = createDapiClientMock(this.sinon);
    parentDocument = getDpnsDocumentFixture.getParentDocumentFixture();
    dataContract = getDpnsContractFixture();
    dapiClientMock.getDocuments
      .resolves([parentDocument.serialize()]);

    dppMock = createDPPMock(this.sinon);
    dppMock.document.createFromSerialized.returns(parentDocument);

    resolveByRecordMethod = resolveByRecordMethodFactory(dapiClientMock, dppMock, dataContract);
  });

  it('should return a document', async () => {
    const result = await resolveByRecordMethod('name', 'value');

    expect(result).to.be.an.instanceOf(Document);
    expect(result).to.deep.equal(parentDocument);

    expect(dapiClientMock.getDocuments).to.have.been.calledOnceWith(
      dataContract.getId(),
      'domain',
      {
        where: [
          ['records.name', '==', 'value'],
        ],
      },
    );

    expect(dppMock.document.createFromSerialized).to.have.been.calledOnceWithExactly(
      parentDocument.serialize(),
      { skipValidation: true },
    );
  });

  it('should throw an error if no documents found', async () => {
    dapiClientMock.getDocuments.resolves([]);

    try {
      await resolveByRecordMethod('name', 'value');

      expect.fail('Error has not been thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(Error);
      expect(e.message).to.equal('Domain with record \'name\' of value \'value\' was not found');
    }
  });
});
