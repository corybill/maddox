"use strict";

const Preconditions = require("preconditions");

const Scenario = require("./scenario"),
  MaddoxPerf = require("../perf/maddox-perf"),
  ErrorFactory = require("../plugins/error-factory"),
  constants = require("../constants"),
  ReportProxy = require("../proxies/report-proxy");

const preconditions = Preconditions.errr();

class FromCallbackScenario extends Scenario {

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        this._inputParams_.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      });
    };
  }

  _validateScenario_(testable) {
    const inputParams = this._getInputParams_();
    const entryPointFunction = this._getEntryPointFunction_();

    preconditions.shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({testable}).test();

    preconditions.shouldBeDefined(entryPointFunction, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({entryPointFunction}).test();

    preconditions.shouldBeDefined(inputParams, ErrorFactory.build(constants.errorMessages.MissingInputParams))
      .debug({inputParams}).test();

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
