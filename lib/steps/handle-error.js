"use strict";

class FinishTest {

  static next(state) {
    const mock = state._getMock_();

    mock.restoreMocks();
  }

}

module.exports = FinishTest;
