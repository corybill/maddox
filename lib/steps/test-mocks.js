"use strict";

class TestMocks {

  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const mock = state._getMock_();

    if (shouldExecuteTest) {
      return mock.test();
    }
  }

}

module.exports = TestMocks;
