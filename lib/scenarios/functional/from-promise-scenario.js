"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const Errr = require("errr");

class FromPromiseScenario extends Scenario {

  test(testableFunction) {
    this._validate(testableFunction);

    if (this._shouldExecuteFunctionalTest_()) {
      this.calledTestableFunction = false;
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(function (result) {
        this._mock_.test();

        this.calledTestableFunction = true;
        testableFunction(undefined, result);

        this._restoreMocks_();

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
      }.bind(this));
    } else {
      if (this._isPerformanceTest_() && this.skipTest) {
        this.skipTest();
      }
    }
  }
}

module.exports = FromPromiseScenario;
