"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const Errr = require("errr");

class FromPromiseScenario extends Scenario {

  test(testableFunction) {
    this.validate(testableFunction);

    this.calledTestableFunction = false;
    this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then((result) => {
      this._mock_.test();

      this.calledTestableFunction = true;
      testableFunction(undefined, result);

      this._restoreMocks_();

    }).catch((err) => {
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
    });
  }
}

module.exports = FromPromiseScenario;
