"use strict";

class TestMocks {

  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const mock = state._getMock_();

    if (shouldExecuteTest) {
      mock.test();
    }
  }

}

module.exports = TestMocks;
