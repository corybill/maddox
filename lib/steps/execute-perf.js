"use strict";

const ReportProxy = require("../proxies/report-proxy");
const MaddoxPerf = require("../perf/maddox-perf");

class ExecutePerfTest {

  static next(state) {
    return new Promise((resolve, reject) => {
      const shouldExecutePerfTest = state._shouldExecutePerfTest_();
      const testTitle = state._getTestTitle_();
      const runnable = state._getPerfRunnable_();

      if (shouldExecutePerfTest) {
        const context = {
          numSamples: process.maddox.numSamples,
          sampleTime: process.maddox.sampleLength,
          runnable
        };

        MaddoxPerf.newPerfTest(context).run().then((stats) => {
          ReportProxy.addNewReport(testTitle, stats);
          resolve();
        }).catch((err) => {
          reject(err);
        });
      } else {
        resolve();
      }
    });
  }

}

module.exports = ExecutePerfTest;
