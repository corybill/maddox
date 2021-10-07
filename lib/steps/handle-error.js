
const Errr = require('errr');

const ErrorFactory = require('../plugins/error-factory');
const constants = require('../constants');

class HandleError {

  static next(state, err) {
    const mock = state._getMock_();
    const testable = state._getTestable_();
    const hasTestableBeenExecuted = state._hasTestableBeenExecuted_();
    const executionError = state._getError_();
    const maddoxRuntimeError = mock.getMaddoxRuntimeError();

    mock.restoreMocks();

    // If we have executed there testable function, then we should not be able to get here because proper tests need
    // to catch their own errors to negate false positives.
    // Since we have already called their testable function, we cannot call it again so we will just throw with
    // an appended message, alerting them to handle their errors in their tests.

    if (hasTestableBeenExecuted) {
      Errr.newError(ErrorFactory.build(constants.errorMessages.TestFailure)).appendTo(err).throw();
    } else if (maddoxRuntimeError) {
      const errr = Errr.fromError(maddoxRuntimeError);

      if (executionError) {
        errr.appendTo(executionError);
      }

      errr.throw();
    } else {
      const errr = Errr.fromError(err);

      if (executionError) {
        errr.appendTo(executionError);
      }

      testable(errr.get());
    }
  }

}

module.exports = HandleError;
