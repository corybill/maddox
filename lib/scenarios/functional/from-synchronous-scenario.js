"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const Errr = require("errr");

class FromSynchronousScenario extends Scenario {

  test(testableFunction) {
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
    } else {
      if (this._isPerformanceTest_() && this.skipTest) {
        this.skipTest();
      }
    }
  }
}

module.exports = FromSynchronousScenario;
