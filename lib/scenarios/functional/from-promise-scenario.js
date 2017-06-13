"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  MaddoxPerf = require("../../perf/maddox-perf"),
  ReportProxy = require("../../proxies/report-proxy"),
  constants = require("../../constants");

const Errr = require("errr");

class FromPromiseScenario extends Scenario {

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
        this.calledTestableFunction = false;

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(function (result) {
          this._mock_.test();

          this.calledTestableFunction = true;
          testableFunction(undefined, result);

          this._restoreMocks_();
          resolve();

        }.bind(this)).catch(function (err) {
          try {
            this._restoreMocks_();

            if (this.calledTestableFunction) {
              Errr.newError(ErrorFactory.build(constants.errorMessages.CatchOwnErrors)).appendTo(err).throw();
            } else {
              testableFunction(err, undefined);
            }
          } catch (mockTestError) {
            testableFunction(mockTestError, undefined);
          }

          resolve();
        }.bind(this));
      } else {
        resolve();
      }
    });
  }

  _executePerfTest_() {
    return new Promise((resolve) => {
      if (this._shouldExecutePerformanceTest_()) {
        const runnable = (sampleDone) => {
          this._resetScenario_();
          this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(() => {
            sampleDone();
          });
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

module.exports = FromPromiseScenario;
