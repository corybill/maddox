"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  MaddoxPerf = require("../../perf/maddox-perf"),
  ReportProxy = require("../../proxies/report-proxy"),
  constants = require("../../constants");

const Errr = require("errr");

class FromCallbackScenario extends Scenario {

  test(testableFunction) {
    this._validate(testableFunction);

    this._executeFunctionalTest_(testableFunction).then(() => {
      this._resetScenario_();

      return this._executePerfTest_();
    }).then(() => {
      this._restoreMocks_();

      if (this._isPerformanceTest_() && this.skipTest) {
        this.skipTest();
      }
    });
  }

  _executeFunctionalTest_(testableFunction) {
    return new Promise((resolve) => {
      if (this._shouldExecuteFunctionalTest_()) {

        this._inputParams_.push((err, result) => {
          if (err) {
            this._restoreMocks_();
            testableFunction(err);
          } else {
            this.calledTestableFunction = false;
            this._mock_.test();
            this._restoreMocks_();

            try {
              // Try / Catch around testable function so we can append warning to error.
              this.calledTestableFunction = true;
              testableFunction(err, result);
            } catch (testError) {
              this._restoreMocks_();
              Errr.newError(ErrorFactory.build(constants.errorMessages.CatchOwnErrors)).appendTo(testError).throw();
            }
          }

          resolve();
        });

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      } else {
        resolve();
      }
    });
  }

  _executePerfTest_() {
    this._inputParams_.push("THIS IS A PLACE HOLDER");

    return new Promise((resolve) => {
      if (this._shouldExecutePerformanceTest_()) {
        const runnable = (sampleDone) => {
          this._resetScenario_();

          this._inputParams_[this._inputParams_.length - 1] = () => {
            sampleDone();
          };

          this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
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

module.exports = FromCallbackScenario;
