/**
 * @param sinonSandbox
 * @return {{fetchContract: function(id:string) : Promise<Contract|null>,
 *     fetchTransaction: function(id:string) : Promise<{confirmations: number}>,
 *     fetchDocuments: function(contractId:string, type:string, where: Object) : Promise<Object[]>,
 *     getLastUserStateTransitionHash: function(regTxId:string) : Promise<string>,
 *     sendRawTransition: function(rawStateTransition:string, rawSTPacket:string) : Promise<string>,
 *     }}
 */
module.exports = function createDapiClientMock(sinonSandbox) {
  return {
    fetchContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
    getLastUserStateTransitionHash: sinonSandbox.stub(),
    sendRawTransition: sinonSandbox.stub(),
  };
};
