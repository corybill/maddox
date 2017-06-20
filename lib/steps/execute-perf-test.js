"use strict";

class ExecuteTest {

  static next(state) {
    const shouldExecuteTest = state.getShouldExecuteTest();

    if (shouldExecuteTest) {
      return state._executeTest_().then(() => {
        this._mock_.test();
      });
    }
  }

}

module.exports = ExecuteTest;
