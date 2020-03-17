/* eslint-disable import/no-extraneous-dependencies, no-console */
const { argv } = require('yargs')
  .usage(
    'Usage: $0 --domainName [string] --dapiAddress [string] --contractId [string] --serializedIdentity [string] --identityPrivateKey [string]',
  )
  .demandOption([
    'domainName', 'dapiAddress', 'contractId', 'serializedIdentity', 'identityPrivateKey',
  ]);

const {
  PrivateKey,
} = require('@dashevo/dashcore-lib');

const DAPIClient = require('@dashevo/dapi-client');
const DashPlatformProtocol = require('@dashevo/dpp');
const DPNSClient = require('../lib/DPNSClient');

async function registerDomain() {
  const seeds = [
    { service: argv.dapiAddress },
  ];

  const dapiClient = new DAPIClient({
    seeds,
    timeout: 30000,
  });

  const dpp = new DashPlatformProtocol({ dataProvider: {} });
  const identity = await dpp.identity.createFromSerialized(argv.serializedIdentity);

  const walletMock = {
    getAccount: () => ({
      getIdentityPrivateKey: () => new PrivateKey(argv.identityPrivateKey),
    }),
  };

  const client = new DPNSClient(dapiClient, walletMock, argv.contractId);

  await client.register(argv.domainName, identity, {
    dashIdentity: identity.getId(),
  });

  console.log('Successfully registered domain: ', argv.domainName);
}

registerDomain()
  .catch((e) => console.error(e));
