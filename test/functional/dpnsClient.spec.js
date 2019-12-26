const startDapi = require('@dashevo/dp-services-ctl/lib/services/startDapi');

const DashPlatformProtocol = require('@dashevo/dpp');
const Identity = require('@dashevo/dpp/lib/identity/Identity');
const IdentityPublicKey = require('@dashevo/dpp/lib/identity/IdentityPublicKey');
const stateTransitionTypes = require('@dashevo/dpp/lib/stateTransition/stateTransitionTypes');

const {
  PrivateKey,
  PublicKey,
  Transaction,
} = require('@dashevo/dashcore-lib');

const dpnsDocuments = require('@dashevo/dpns-contract/src/schema/dpns-documents');

const DPNSClient = require('../../lib/DPNSClient');

const DPNSTestDataProvider = require('../../lib/test/DPNSTestDataProvider');

const wait = require('../../lib/utils/wait');

/**
 * Register some identity
 *
 * @param {DashPlatformProtocol} dpp
 * @param {DashCoreApi} dashCoreApi
 * @param {DAPIClient} dapiClient
 * @param {{ outPoint: string }} options // to override and always get the same identity id
 *
 * @return {{
 *  id: string,
 *  privateKey: PrivateKey,
 *  publicKey: PublicKey,
 * }}
 */
async function registerIdentity(dpp, dashCoreApi, dapiClient, options = {}) {
  const { result: addressString } = await dashCoreApi.getNewAddress();
  const { result: privateKeyString } = await dashCoreApi.dumpPrivKey(addressString);

  const privateKey = new PrivateKey(privateKeyString);
  const pubKeyBase = new PublicKey({
    ...privateKey.toPublicKey().toObject(),
    compressed: true,
  }).toBuffer()
    .toString('base64');

  // eslint-disable-next-line no-underscore-dangle
  const publicKeyHash = PublicKey.fromBuffer(Buffer.from(pubKeyBase, 'base64'))
    ._getID();

  await dashCoreApi.generate(500);
  await dashCoreApi.sendToAddress(addressString, 10);
  await dashCoreApi.generate(10);

  const { result: unspent } = await dashCoreApi.listUnspent();
  const inputs = unspent.filter((input) => input.address === addressString);

  const transaction = new Transaction();

  transaction.from(inputs)
    .addBurnOutput(10000, publicKeyHash)
    .change(addressString)
    .fee(668)
    .sign(privateKey);

  await dashCoreApi.sendrawtransaction(transaction.serialize());
  await dashCoreApi.generate(1);

  await wait(2000); // wait a couple of seconds for tx to be confirmed

  let outPoint = transaction.getOutPointBuffer(0)
    .toString('base64');

  if (options.outPoint) {
    outPoint = options.outPoint;
  }

  const identityCreateTransition = await dpp.stateTransition.createFromObject({
    protocolVersion: 0,
    type: stateTransitionTypes.IDENTITY_CREATE,
    lockedOutPoint: outPoint,
    identityType: Identity.TYPES.APPLICATION,
    publicKeys: [
      {
        id: 1,
        type: IdentityPublicKey.TYPES.ECDSA_SECP256K1,
        data: pubKeyBase,
        isEnabled: true,
      },
    ],
  }, { skipValidation: true });

  const identityPublicKey = new IdentityPublicKey()
    .setId(1)
    .setType(IdentityPublicKey.TYPES.ECDSA_SECP256K1)
    .setData(pubKeyBase);

  identityCreateTransition.sign(identityPublicKey, privateKey);

  await dapiClient.applyStateTransition(identityCreateTransition);

  return {
    id: identityCreateTransition.getIdentityId(),
    privateKey,
    publicKey: identityPublicKey,
  };
}

describe('DPNS client', function main() {
  this.timeout(360000);

  let dapiInstance;
  let dapiClient;
  let dpp;
  let dpnsWalletMock;
  let dpnsUserIdentityMock;
  let walletMock;
  let userIdentityMock;

  beforeEach(async () => {
    dapiInstance = await startDapi({
      machine: {
        container: {
          envs: [
            'DPNS_CONTRACT_ID=BEy2dxPtrwFLP2s6a5iXmSruvjoEpH2x4fQK4eVN8VM7',
            'DPNS_TOP_LEVEL_IDENTITY=BEy2dxPtrwFLP2s6a5iXmSruvjoEpH2x4fQK4eVN8VM7',
          ],
        },
      },
      drive: {
        container: {
          envs: [
            'DPNS_CONTRACT_ID=BEy2dxPtrwFLP2s6a5iXmSruvjoEpH2x4fQK4eVN8VM7',
            'DPNS_TOP_LEVEL_IDENTITY=BEy2dxPtrwFLP2s6a5iXmSruvjoEpH2x4fQK4eVN8VM7',
          ],
        },
      },
    });

    const {
      dashCore,
      dapiCore,
      tendermintCore,
    } = dapiInstance;

    const dashCoreApi = dashCore.getApi();
    dapiClient = dapiCore.getApi();
    const tendermintRPCClient = tendermintCore.getClient();

    // activate everything
    await dashCoreApi.generate(500);

    const validationlessDPP = new DashPlatformProtocol();

    dpp = new DashPlatformProtocol({
      dataProvider: new DPNSTestDataProvider(
        validationlessDPP,
        tendermintRPCClient,
      ),
    });

    const {
      id: dpnsIdentityId,
      privateKey: dpnsPrivateKey,
      publicKey: dpnsPublicKey,
    } = await registerIdentity(dpp, dashCoreApi, dapiClient, {
      outPoint: '5VBUIlJC884kZrZ5eHXVrXw1Gwv/gHnVyyMVyjGJc3oAAAAA',
    });

    dpnsWalletMock = {
      getAccount: () => ({
        getIdentityPrivateKey: () => dpnsPrivateKey,
      }),
    };

    dpnsUserIdentityMock = {
      getId: () => dpnsIdentityId,
      getPublicKeyById: () => dpnsPublicKey,
    };

    process.env.DPNS_IDENTITY_ID = dpnsIdentityId;

    const dataContract = dpp.dataContract.create(dpnsIdentityId, dpnsDocuments);
    const dataContractST = dpp.dataContract.createStateTransition(dataContract);
    dataContractST.sign(dpnsPublicKey, dpnsPrivateKey);

    await dapiClient.applyStateTransition(dataContractST);

    const {
      id: userIdentityId,
      privateKey: userPrivateKey,
      publicKey: userPublicKey,
    } = await registerIdentity(dpp, dashCoreApi, dapiClient);

    walletMock = {
      getAccount: () => ({
        getIdentityPrivateKey: () => userPrivateKey,
      }),
    };

    userIdentityMock = {
      getId: () => userIdentityId,
      getPublicKeyById: () => userPublicKey,
    };
  });

  it('should be able to register and resolve a domain', async () => {
    const dpnsClient = new DPNSClient(dapiClient, dpnsWalletMock);
    await dpnsClient.register('dash', dpnsUserIdentityMock, {
      dashIdentity: dpnsUserIdentityMock.getId(),
    });

    const domainDocument = await dpnsClient.resolve('dash.');

    expect(domainDocument.data.label).to.equal('dash');
    expect(domainDocument.data.normalizedParentDomainName).to.equal('');
    expect(domainDocument.data.records).to.deep.equal({
      dashIdentity: dpnsUserIdentityMock.getId(),
    });
  });

  it('should be able to register lower level domain', async () => {
    const dpnsClient = new DPNSClient(dapiClient, dpnsWalletMock);
    await dpnsClient.register('dash', dpnsUserIdentityMock, {
      dashIdentity: dpnsUserIdentityMock.getId(),
    });

    const userDPNSClient = new DPNSClient(dapiClient, walletMock);
    await userDPNSClient.register('wallet.dash.', userIdentityMock, {
      dashIdentity: userIdentityMock.getId(),
    });

    const domainDocument = await userDPNSClient.resolve('wallet.dash.');

    expect(domainDocument.data.label).to.equal('wallet');
    expect(domainDocument.data.normalizedParentDomainName).to.equal('dash.');
    expect(domainDocument.data.records).to.deep.equal({
      dashIdentity: userIdentityMock.getId(),
    });
  });

  it('should be able to search a domain', async () => {
    const dpnsClient = new DPNSClient(dapiClient, dpnsWalletMock);
    await dpnsClient.register('dash', dpnsUserIdentityMock, {
      dashIdentity: dpnsUserIdentityMock.getId(),
    });

    const [domainDocument] = await dpnsClient.search('da');

    expect(domainDocument.data.label).to.equal('dash');
    expect(domainDocument.data.normalizedParentDomainName).to.equal('');
    expect(domainDocument.data.records).to.deep.equal({
      dashIdentity: dpnsUserIdentityMock.getId(),
    });
  });

  it('should be able to resolve domain by it\'s record', async () => {
    const dpnsClient = new DPNSClient(dapiClient, dpnsWalletMock);
    await dpnsClient.register('dash', dpnsUserIdentityMock, {
      dashIdentity: dpnsUserIdentityMock.getId(),
    });

    const domainDocument = await dpnsClient.resolveByRecord('dashIdentity', dpnsUserIdentityMock.getId());

    expect(domainDocument.data.label).to.equal('dash');
    expect(domainDocument.data.normalizedParentDomainName).to.equal('');
    expect(domainDocument.data.records).to.deep.equal({
      dashIdentity: dpnsUserIdentityMock.getId(),
    });
  });

  afterEach(async () => {
    await dapiInstance.remove();
  });
});
