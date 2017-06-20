"use strict";

const Preconditions = require("preconditions");

const Scenario = require("./scenario"),
  ErrorFactory = require("../plugins/error-factory"),
  constants = require("../constants");

const preconditions = Preconditions.errr();

class FromPromiseScenario extends Scenario {

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then((result) => {
          resolve(result);
        }).catch((err) => {
          reject(err);
        });

      });
    };
  }

  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(() => {
        sampleDone();
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

}

module.exports = FromPromiseScenario;
