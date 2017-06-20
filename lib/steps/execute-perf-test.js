"use strict";

const ReportProxy = require("../proxies/report-proxy");
const MaddoxPerf = require("../perf/maddox-perf");

class ExecutePerfTest {

  static next(state) {
    const shouldExecutePerfTest = state._shouldExecutePerfTest_();
    const testTitle = state._getTestTitle_();
    const runnable = state._getTestRunnable_();

    if (shouldExecutePerfTest) {
      const context = {
        numSamples: process.maddox.numSamples,
        sampleTime: process.maddox.sampleLength,
        runnable
      };

      MaddoxPerf.newPerfTest(context).run().then((stats) => {
        ReportProxy.addNewReport(testTitle, stats);
      });
    }
  }

}

module.exports = ExecutePerfTest;
