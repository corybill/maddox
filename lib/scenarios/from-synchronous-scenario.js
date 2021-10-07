const Preconditions = require('preconditions');
const BluebirdPromise = require('bluebird');

const Scenario = require('./scenario'),
  ErrorFactory = require('../plugins/error-factory'),
  constants = require('../constants');

const preconditions = Preconditions.errr();

class FromSynchronousScenario extends Scenario {

  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.FromSynchronousScenario;
  }

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        const result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

        if ((result instanceof BluebirdPromise) || (result instanceof Promise)) {
          const message = ErrorFactory.build(constants.errorMessages.ResponseCannotBePromise);
          const error = new Error(message);

          this._getMock_().setMaddoxRuntimeError(error);

          reject(error);
        } else {
          resolve(result);
        }
      });
    };
  }

  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      sampleDone();
    };
  }

  _validateScenario_(testable) {
    const entryPointFunction = this._getEntryPointFunction_();

    preconditions.shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({ testable }).test();

    preconditions.shouldBeDefined(entryPointFunction, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({ entryPointFunction }).test();
  }
}

module.exports = FromSynchronousScenario;
