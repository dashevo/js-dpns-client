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

const wait = require('../../lib/utils/wait');

async function registerIdentity(dpp, dashCoreApi, dapiClient) {
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

  const outPoint = transaction.getOutPointBuffer(0)
    .toString('base64');

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

  await dapiClient.updateState(identityCreateTransition);

  return {
    id: identityCreateTransition.getIdentityId(),
    privateKey,
    publicKey: identityPublicKey,
  };
}

describe('register', function main() {
  this.timeout(360000);

  let dapiInstance;
  let dapiClient;
  let dpp;
  let walletMock;
  let userIdentity;

  beforeEach(async () => {
    dapiInstance = await startDapi();

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

    const otherDPP = new DashPlatformProtocol();

    dpp = new DashPlatformProtocol({
      dataProvider: {
        fetchIdentity: async (id) => {
          const data = Buffer.from(id).toString('hex');

          const {
            result: {
              response: {
                value: serializedIdentity,
              },
            },
          } = await tendermintRPCClient.request(
            'abci_query',
            {
              path: '/identity',
              data,
            },
          );

          if (!serializedIdentity) {
            return null;
          }

          return otherDPP.identity.createFromSerialized(
            Buffer.from(serializedIdentity, 'base64'),
            { skipValidation: true },
          );
        },
      },
    });

    const {
      id: dpnsIdentityId,
      privateKey: dpnsPrivateKey,
      publicKey: dpnsPublicKey,
    } = await registerIdentity(dpp, dashCoreApi, dapiClient);

    process.env.DPNS_IDENTITY_ID = dpnsIdentityId;

    const dataContract = dpp.dataContract.create(dpnsIdentityId, dpnsDocuments);
    const dataContractST = dpp.dataContract.createStateTransition(dataContract);
    dataContractST.sign(dpnsPublicKey, dpnsPrivateKey);

    await dapiClient.updateState(dataContractST);

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

    userIdentity = {
      getId: () => userIdentityId,
      getPublicKeyById: () => userPublicKey,
    };
  });

  it('should register a domain', async () => {
    const dpnsClient = new DPNSClient(dapiClient, walletMock, userIdentity);
    await dpnsClient.register('user.wallet.dash');

    await dpnsClient.resolve('user.wallet.dash');

    await dpnsClient.search('us', 'wallet.dash');

    await dpnsClient.resolveByRecord('dashIdentity', userIdentity.getId());
  });

  afterEach(async () => {
    await dapiInstance.remove();
  });
});
