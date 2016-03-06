"use strict";

const Preconditions = require("preconditions"),
  _ = require("lodash"),
  Promise = require("bluebird");

const Scenario = require("./../scenario"),
  Mock = require("../../mocks/mock"),
  ErrorFactory = require("../../plugins/error-factory"),
  HttpResponse = require("../../mocks/http-response-mock"),
  constants = require("../../constants");

const preconditions = Preconditions.singleton();

class HttpReqScenario extends Scenario {
  constructor(done) {
    super(done);

    this._responseMock_ = new HttpResponse();
    this._finishedHasBeenSet_ = false;
  }

  resShouldBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithFunctionString))
      .shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray));

    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this._responseMock_);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    if (constants.ResponseEndFunctions[funcName]) {
      preconditions.checkArgument(!this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher, [_.keys(constants.ResponseFinishers)]));
      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants.ResponseMockName, funcName);
      this._mock_.doesReturn(constants.ResponseMockName, funcName, this._responseMock_, Mock.SynchronousType, false);
    }

    return this;
  }

  resShouldBeChainable(funcName) {
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this._responseMock_);
    this._mock_.doesReturn(constants.ResponseMockName, funcName, this._responseMock_, Mock.SynchronousType, false);
    return this;
  }

  test(done) {
    try {
      preconditions.shouldBeDefined(this._entryPointObject_, "You must define a valid object entry point before executing the test.")
        .shouldBeDefined(this._entryPointFunction_, "You must define a valid function entry point inside of the entry point object before executing the test.")
        .shouldBeFunction(done, "You must always pass in the 'done' function into the 'test' function from your test.")
        .shouldBeDefined(this._inputParams_, "You need to define the Http Request object using the 'withHttpRequest' function.")
        .checkArgument(this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher, [_.keys(constants.ResponseFinishers)]));

      this._executeTest_().then(() => {
        this._executeExpectations_();
        this._restoreMocks_();
        done();

      }).catch((err) => {
        this._restoreMocks_();
        done(err);

      });

    } catch (err) {
      done(err);
    }
  }

  _executeTest_() {
    return new Promise((resolve) => {
      this._mock_.setCallbackForResponseEnd(resolve);

      this._inputParams_.push(this._responseMock_);

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    });
  }

  _executeExpectations_() {
    this._mock_.test();
  }
}

module.exports = HttpReqScenario;
