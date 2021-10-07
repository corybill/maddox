
class TestMocks {

  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const mock = state._getMock_();

    // Do NOT tests mocks if it is a passthrough error or the state says not to.
    if (shouldExecuteTest) {
      mock.test();
    }
  }

}

module.exports = TestMocks;
