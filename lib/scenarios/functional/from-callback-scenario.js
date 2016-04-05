"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const Errr = require("errr");

class FromCallbackScenario extends Scenario {

  test(testableFunction) {
    this.validate(testableFunction);

    this._inputParams_.push(function (err, result) {
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
    }.bind(this));

    this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
  }

}

module.exports = FromCallbackScenario;
