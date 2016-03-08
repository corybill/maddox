"use strict";

const Preconditions = require("preconditions"),
  _ = require("lodash"),
  Benchmark = require("benchmark"),
  Promise = require("bluebird");

const Scenario = require("./../scenario"),
  Mock = require("../../mocks/mock"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const preconditions = Preconditions.singleton();

class HttpReqScenario extends Scenario {
  constructor(done) {
    super(done);

    this._responseMock_ = {};
    this._finishedHasBeenSet_ = false;
  }

  // TODO: resDoesError / resDoesReturn

  resShouldBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithFunctionString))
      .shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray));

    this._responseMock_[funcName] = this._responseMock_[funcName] || function () {};
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this._responseMock_);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    if (constants.ResponseEndFunctions[funcName]) {
      preconditions.checkArgument(!this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher, [_.keys(constants.ResponseEndFunctions)]));
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
    preconditions.shouldBeDefined(this._entryPointObject_, "You must define a valid object entry point before executing the test.")
      .shouldBeDefined(this._entryPointFunction_, "You must define a valid function entry point inside of the entry point object before executing the test.")
      .shouldBeFunction(done, "You must always pass in the 'done' function into the 'test' function from your test.")
      .shouldBeDefined(this._inputParams_, "You need to define the Http Request object using the 'withHttpRequest' function.")
      .checkArgument(this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher, [_.keys(constants.ResponseFinishers)]));

    this._executeFunctionalTest_().then(function () {
      this._resetScenario_();
      return this._executePerfTest_();

    }.bind(this)).then(function () {
      this._restoreMocks_();
      done();

    }.bind(this)).catch(function (err) {
      this._restoreMocks_();
      done(err);

    }.bind(this));
  }

  _executeFunctionalTest_() {
    return new Promise(function (resolve, reject) {
      if (this._shouldExecuteFunctionalTest_()) {
        this._executeTest_().then(function () {
          this._mock_.test();
          resolve();
        }.bind(this)).catch(function (err) {
          reject(err);
        });

      } else {
        resolve();
      }
    }.bind(this));
  }

  _executePerfTest_() {
    return new Promise(function (resolve) {
      if (this._shouldExecutePerformanceTest_()) {
        let suite = new Benchmark.Suite();

        suite.add(this._perfTitle_, {
          defer: true,
          fn: function (deferred) {
            this._mock_.setCallbackForResponseEnd(function () {
              this._resetScenario_();
              deferred.resolve();
            }.bind(this));
            this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
          }.bind(this)
        }).on("complete", function () {
          // console.log(JSON.stringify(data, null, 2));
          resolve();
        }).run();
      } else {
        resolve();
      }
    }.bind(this));
  }

  _executeTest_() {
    return new Promise((resolve) => {
      this._mock_.setCallbackForResponseEnd(resolve);

      this._inputParams_.push(this._responseMock_);

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    });
  }
}

module.exports = HttpReqScenario;
