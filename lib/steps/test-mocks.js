"use strict";

const CoreUtilIs = require("core-util-is");

class TestMocks {

  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const error = state._getError_();
    const mock = state._getMock_();

    // Do NOT tests mocks if it is a passthrough error or the state says not to.
    if (shouldExecuteTest && (error === undefined || !CoreUtilIs.isError(error) || error.isPassThroughError !== true)) {
      mock.test();
    }
  }

}

module.exports = TestMocks;
