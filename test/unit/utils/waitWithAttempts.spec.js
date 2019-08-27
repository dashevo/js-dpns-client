const waitWithAttempts = require('../../../lib/utils/waitWithAttempts.js');

const number = 3;

describe('waitWithAttempts', () => {
  let falsyFunctionMock;
  let truthyFunctionMock;
  let exceptionFunctionMock;

  beforeEach(function beforeEach() {
    falsyFunctionMock = this.sinon.stub().resolves(false);
    truthyFunctionMock = this.sinon.stub().resolves(true);
    exceptionFunctionMock = this.sinon.stub().rejects(new Error('Simple error'));
  });

  it('should sequentially execute function selected number of attempts waiting for result', async () => {
    const result = await waitWithAttempts(number, falsyFunctionMock, 0);
    expect(result).to.be.false();
    expect(falsyFunctionMock).to.have.been.calledThrice();
  });

  it('should exit early if function returns a result', async () => {
    const result = await waitWithAttempts(number, truthyFunctionMock, 0);
    expect(result).to.be.true();
    expect(truthyFunctionMock).to.have.been.calledOnce();
  });

  it('should throw an error if function throws an error', async () => {
    let error = null;

    try {
      await waitWithAttempts(number, exceptionFunctionMock, 0);
    } catch (e) {
      error = e;
    }

    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.be.equal('Simple error');
    expect(exceptionFunctionMock).to.have.been.calledOnce();
  });
});
