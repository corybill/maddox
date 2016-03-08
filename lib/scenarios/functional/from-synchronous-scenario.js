"use strict";

const Scenario = require("./../scenario");

const Preconditions = require("preconditions");

const preconditions = Preconditions.singleton();

class FromSynchronousScenario extends Scenario {

  test(testableFunction) {
    preconditions.shouldBeObject(this._entryPointObject_, "You must define a valid object entry point before executing the test.")
      .shouldBeFunction(this._entryPointFunction_, "You must define a valid function entry point inside of the entry point object before executing the test.")
      .shouldBeFunction(testableFunction, "You must pass in a function that will test this scenario.")
      .shouldBeObject(this._inputParams_, "You must always pass in the 'done' function from your test.");

    try {
      let result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);

      this._mock_.test();
      testableFunction(undefined, result);

    } catch (err) {
      testableFunction(err);
    }
  }
}

module.exports = FromSynchronousScenario;
