"use strict";

const Preconditions = require("preconditions");

const Scenario = require("./scenario"),
  MaddoxPerf = require("../perf/maddox-perf"),
  ErrorFactory = require("../plugins/error-factory"),
  constants = require("../constants"),
  ReportProxy = require("../proxies/report-proxy");

const preconditions = Preconditions.errr();

class FromSynchronousScenario extends Scenario {

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        try {
          const result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

          resolve(result);
        } catch (err) {
          reject(err);
        }
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
