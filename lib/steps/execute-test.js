"use strict";

class ExecuteTest {

  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const runnable = state._getTestRunnable_();
    const mock = state._getMock_();

    if (shouldExecuteTest) {
      return runnable().then((result) => {
        state._setTestResult_(result);
        mock.test();
      }).catch((err) => {
        state._setError_(err);
      });
    }
  }

}

module.exports = ExecuteTest;
