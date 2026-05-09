import ReportProxy from '../proxies/report-proxy.js';
import MaddoxPerf from '../perf/maddox-perf.js';

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

        MaddoxPerf.newPerfTest(context)
          .run()
          .then((stats) => {
            ReportProxy.addNewReport(testTitle, stats);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        resolve();
      }
    });
  }
}

export default ExecutePerfTest;
