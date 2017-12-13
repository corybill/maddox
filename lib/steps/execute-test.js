"use strict";

class ExecuteTest {

  static next(state) {
    return new Promise((resolve, reject) => {
      const mock = state._getMock_();
      const shouldExecuteTest = state._shouldExecuteTest_();
      const runnable = state._getTestRunnable_();

      if (shouldExecuteTest) {
        runnable().then((result) => {
          const maddoxRuntimeError = mock.getMaddoxRuntimeError();

          if (maddoxRuntimeError !== undefined) {
            reject(maddoxRuntimeError);
          } else {
            state._setTestResult_(result);
            resolve();
          }
        }).catch((err) => {
          const maddoxRuntimeError = mock.getMaddoxRuntimeError();

          if (maddoxRuntimeError !== undefined) {
            reject(maddoxRuntimeError);
          } else {
            state._setError_(err);
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

}

module.exports = ExecuteTest;
