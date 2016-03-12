"use strict";

const Scenario = require("./../scenario"),
  Preconditions = require("preconditions");

const preconditions = Preconditions.singleton();

class FromPromiseScenario extends Scenario {

  test(testableFunction) {
    preconditions.shouldBeObject(this._entryPointObject_, "You must define a valid object entry point before executing the test.")
      .shouldBeFunction(this._entryPointFunction_, "You must define a valid function entry point inside of the entry point object before executing the test.")
      .shouldBeFunction(testableFunction, "You must pass in a function that will test this scenario.");

    this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then((result) => {
      this._mock_.test();
      testableFunction(undefined, result);
    }).catch(function (err) {
      testableFunction(err);
    });
  }

}

module.exports = FromPromiseScenario;
