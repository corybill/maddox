"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  MaddoxPerf = require("../../perf/maddox-perf"),
  ReportProxy = require("../../proxies/report-proxy"),
  constants = require("../../constants");

const Errr = require("errr");

class FromSynchronousScenario extends Scenario {

  test(testableFunction) {
    this._executeFunctionalTest_(testableFunction);
    this._resetScenario_();

    this._executePerfTest_().then(() => {
      this._restoreMocks_();

      if (this._isPerformanceTest_() && this.skipTest) {
        this.skipTest();
      }
    }).catch((err) => {
      throw err;
    });
  }

  _executeFunctionalTest_(testableFunction) {
    this._validate(testableFunction);

    if (this._shouldExecuteFunctionalTest_()) {
      try {
        let result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

        this._mock_.test();

        try {
          this._restoreMocks_();

          // Try / Catch around testable function so we can append warning to error.
          testableFunction(undefined, result);
        } catch (err) {
          Errr.newError(ErrorFactory.build(constants.errorMessages.CatchOwnErrors)).appendTo(err).throw();
        }

      } catch (err) {
        this._restoreMocks_();
        testableFunction(err, undefined);
      }

      this._restoreMocks_();
    }
  }

  _executePerfTest_() {
    return new Promise((resolve) => {
      if (this._shouldExecutePerformanceTest_()) {
        const runnable = (sampleDone) => {
          this._resetScenario_();
          this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
          sampleDone();
        };

        const context = {
          numSamples: process.maddox.numSamples,
          sampleTime: process.maddox.sampleLength,
          runnable
        };

        MaddoxPerf.newPerfTest(context).runSynchronously().then((stats) => {
          ReportProxy.addNewReport(this._perfTitle_, stats);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = FromSynchronousScenario;
