const rewiremock = require('rewiremock/node');

const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const getDpnsContractFixture = require('../../lib/test/fixtures/getDpnsContractFixture');
const getDpnsDocumentFixture = require('../../lib/test/fixtures/getDpnsDocumentFixture');

describe('DPNSClient', () => {
  let parentDocument;
  let DPNSClient;
  let registerMethodFactoryMock;
  let resolveMethodFactoryMock;
  let resolveByRecordMethodFactoryMock;
  let searchMethodFactoryMock;
  let dppMock;
  let dataContract;

  beforeEach(function beforeEach() {
    dataContract = getDpnsContractFixture();
    parentDocument = getDpnsDocumentFixture.getParentDocumentFixture();

    dppMock = createDPPMock(this.sinon);
    dppMock.dataContract.create.returns(dataContract);

    const dppClassMock = this.sinon.stub();
    dppClassMock.returns(dppMock);

    registerMethodFactoryMock = this.sinon.stub();
    registerMethodFactoryMock.returns(() => parentDocument);

    resolveMethodFactoryMock = this.sinon.stub();
    resolveMethodFactoryMock.returns(() => parentDocument);

    resolveByRecordMethodFactoryMock = this.sinon.stub();
    resolveByRecordMethodFactoryMock.returns(() => parentDocument);

    searchMethodFactoryMock = this.sinon.stub();
    searchMethodFactoryMock.returns(() => parentDocument);

    DPNSClient = rewiremock.proxy('../../lib/DPNSClient', {
      '../../node_modules/@dashevo/dpp': dppClassMock,
      '../../lib/method/registerMethodFactory': registerMethodFactoryMock,
      '../../lib/method/resolveMethodFactory': resolveMethodFactoryMock,
      '../../lib/method/resolveByRecordMethodFactory': resolveByRecordMethodFactoryMock,
      '../../lib/method/searchMethodFactory': searchMethodFactoryMock,
    });
  });

  describe('#constructor', () => {
    it('should set arguments and create methods correctly', () => {
      const dapiClient = { name: 'dapiClient' };
      const wallet = { name: 'wallet' };
      const identity = { name: 'identity' };

      // eslint-disable-next-line no-unused-vars
      const dpnsClient = new DPNSClient(dapiClient, wallet, identity);

      expect(registerMethodFactoryMock).to.have.been.calledOnceWithExactly(
        dapiClient, dppMock, wallet, identity, dataContract,
      );

      expect(resolveMethodFactoryMock).to.have.been.calledOnceWithExactly(
        dapiClient, dppMock, dataContract,
      );

      expect(resolveByRecordMethodFactoryMock).to.have.been.calledOnceWithExactly(
        dapiClient, dppMock, dataContract,
      );

      expect(searchMethodFactoryMock).to.have.been.calledOnceWithExactly(
        dapiClient, dppMock, dataContract,
      );
    });
  });
});
