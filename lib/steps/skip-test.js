class SkipTest {
  static next(state) {
    const isPerformanceTest = state._isPerformanceTest_();

    if (isPerformanceTest && state.skipTest) {
      state.skipTest();
    }
  }
}

export default SkipTest;
