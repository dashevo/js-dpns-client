/**
 * @param sinonSandbox
 * @return {{fetchContract: function(id:string) : Promise<Contract|null>,
 *       fetchTransaction: function(id:string) : Promise<{confirmations: number}>,
 *       fetchDocuments: function(contractId:string, type:string, where: Object) :
 *       getLastUserStateTransitionHash: function(regTxId:string) :
 *       Promise<Document[]>}}
 */
module.exports = function createDapiClientMock(sinonSandbox) {
  return {
    fetchContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
    getLastUserStateTransitionHash: sinonSandbox.stub(),
  };
};
