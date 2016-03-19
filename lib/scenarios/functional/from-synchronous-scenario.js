"use strict";

const Scenario = require("./../scenario");

const Preconditions = require("preconditions");

const preconditions = Preconditions.singleton();

class FromSynchronousScenario extends Scenario {

  test(testableFunction) {
    preconditions.shouldBeObject(this._entryPointObject_, "You must define a valid object entry point before executing the test.")
      .shouldBeFunction(this._entryPointFunction_, "You must define a valid function entry point inside of the entry point object before executing the test.")
      .shouldBeFunction(testableFunction, "You must pass in a function that will test this scenario.");

    try {
      this._calledTestableFunction_ = false;
      let result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

      this._mock_.test();
      this._calledTestableFunction_ = true;
      testableFunction(undefined, result);

    } catch (err) {
      if (!this._calledTestableFunction_) {
        testableFunction(err);
      }
    }
  }
}

module.exports = FromSynchronousScenario;
