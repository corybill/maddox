"use strict";

const Scenario = require("./../scenario"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const Errr = require("errr");

class FromPromiseScenario extends Scenario {

  test(testableFunction) {
    this.validate(testableFunction);

    this.calledTestableFunction = false;
    this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(function (result) {
      this._mock_.test();

      this.calledTestableFunction = true;
      testableFunction(undefined, result);

      this._restoreMocks_();

    }.bind(this)).catch(function (err) {
      try {
        this._mock_.test();

        this._restoreMocks_();

        if (this.calledTestableFunction) {
          Errr.newError(ErrorFactory.build(constants.errorMessages.CatchOwnErrors)).append(err).throw();
        } else {
          testableFunction(err, undefined);
        }
      } catch (mockTestError) {
        testableFunction(mockTestError, undefined);
      }
    }.bind(this));
  }

}

module.exports = FromPromiseScenario;
