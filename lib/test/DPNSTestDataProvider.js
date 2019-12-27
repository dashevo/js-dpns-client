class DPNSTestDataProvider {
  constructor(dpp, tendermintRPCClient) {
    this.dpp = dpp;
    this.tendermintRPCClient = tendermintRPCClient;
  }

  async fetchIdentity(id) {
    const data = Buffer.from(id).toString('hex');

    const {
      result: {
        response: {
          value: serializedIdentity,
        },
      },
    } = await this.tendermintRPCClient.request(
      'abci_query',
      {
        path: '/identity',
        data,
      },
    );

    if (!serializedIdentity) {
      return null;
    }

    return this.dpp.identity.createFromSerialized(
      Buffer.from(serializedIdentity, 'base64'),
      { skipValidation: true },
    );
  }
}

module.exports = DPNSTestDataProvider;
