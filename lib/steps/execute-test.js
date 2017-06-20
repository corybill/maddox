"use strict";

class ExecuteTest {

  static next(state) {
    return new Promise((resolve) => {
      const shouldExecuteTest = state._shouldExecuteTest_();
      const runnable = state._getTestRunnable_();

      if (shouldExecuteTest) {
        runnable().then((result) => {
          state._setTestResult_(result);
          resolve();
        }).catch((err) => {
          state._setError_(err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

}

module.exports = ExecuteTest;
