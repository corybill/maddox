"use strict";

class TestMock {

  static next(state) {
    const shouldExecuteTest = state.getShouldExecuteTest();

    if (shouldExecuteTest) {
      return state.getMock().test();
    }
  }

}

module.exports = TestMock;
