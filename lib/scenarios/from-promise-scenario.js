"use strict";

const Preconditions = require("preconditions");

const Scenario = require("./scenario"),
  ErrorFactory = require("../plugins/error-factory"),
  constants = require("../constants");

const preconditions = Preconditions.errr();

class FromPromiseScenario extends Scenario {

  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.FromPromiseScenario;
  }

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {

        const promise = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

        try {
          preconditions.shouldBeDefined(promise, ErrorFactory.build(constants.errorMessages.ResponseMustBePromise))
            .set("isPassThroughError", true).test();

          preconditions.shouldBeFunction(promise.then, ErrorFactory.build(constants.errorMessages.ResponseMustBePromise))
            .set("isPassThroughError", true).debug({keysOnNonPromise: Object.keys(promise)}).test();

          promise.then((result) => {
            resolve(result);
          }).catch((err) => {
            reject(err);
          });

        } catch (err) {
          reject(err);
        }
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
    const entryPointFunction = this._getEntryPointFunction_();

    preconditions.shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({testable}).test();

    preconditions.shouldBeDefined(entryPointFunction, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({entryPointFunction}).test();
  }

}

module.exports = FromPromiseScenario;
