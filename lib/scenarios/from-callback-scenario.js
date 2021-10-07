
const Preconditions = require('preconditions');

const Scenario = require('./scenario'),
  ErrorFactory = require('../plugins/error-factory'),
  constants = require('../constants');

const preconditions = Preconditions.errr();

class FromCallbackScenario extends Scenario {

  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.FromCallbackScenario;
  }

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

  _setPerfRunnable_() {
    let alreadyAddedCallback = false;

    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();

      const callback = () => { sampleDone(); };

      if (!alreadyAddedCallback) {
        this._inputParams_.push(callback);
        alreadyAddedCallback = true;
      } else {
        this._inputParams_[this._inputParams_.length - 1] = callback;
      }

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
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

module.exports = FromCallbackScenario;
