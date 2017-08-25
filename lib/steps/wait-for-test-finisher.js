"use strict";

// Wait for the Finisher Function to be called before testing the mocks and calling the testable function.
class FinisherFunction {

  static validate(mock) {
    return new Promise((resolve) => {

      function wasFinisherFunctionExecuted() {
        if (mock.wasFinisherFunctionExecuted()) {
          resolve();
        } else {
          wait();
        }
      }

      function wait() {
        setTimeout(() => {
          wasFinisherFunctionExecuted();
        }, 5);
      }

      wait();
    });
  }

}
class ExecuteTest {

  static next(state) {
    return new Promise((resolve) => {
      const hasManualFinisherFunction = state._hasManualFinisherFunction_();
      const shouldExecuteTest = state._shouldExecuteTest_();
      const mock = state._getMock_();

      if (hasManualFinisherFunction && shouldExecuteTest) {
        FinisherFunction.validate(mock).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

}

module.exports = ExecuteTest;
