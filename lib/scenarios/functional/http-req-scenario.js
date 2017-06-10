"use strict";

const Preconditions = require("preconditions"),
  _ = require("lodash"),
  Benchmark = require("benchmark"),
  Promise = require("bluebird");

const Scenario = require("./../scenario"),
  Mock = require("../../mocks/mock"),
  ReportProxy = require("../../proxies/report-proxy"),
  ErrorFactory = require("../../plugins/error-factory"),
  constants = require("../../constants");

const preconditions = Preconditions.errr();

class HttpReqScenario extends Scenario {
  constructor(done) {
    super(done);

    this.HttpResponseMock = {};
    this._finishedHasBeenSet_ = false;
  }

  // TODO: resDoesError / resDoesReturn

  /**
   * Provides same functionality as 'withInputParams' but it provides a lexical name that matches the HttpReqScenario.
   *
   * @param {Object} request - An object representing the structure of a Node HttpRequest. Most common things to add
   * are 'body', 'params', 'query', etc. But you can put anything you'd like into this object.
   * @returns {Scenario}
   */
  withHttpRequest(request) {
    preconditions.shouldBeArray(request, ErrorFactory.build(constants.errorMessages.HttpRequestArray))
      .debug({request: request}).test();
    this._inputParams_ = request;
    return this;
  }

  /**
   * This function is synonymous with the 'shouldBeCalledWith' function except here we are mocking a function on the
   * HttpResponse object that is passed into the controller with the HttpRequest object. Common functions to mock here
   * send, json, statusCode, etc. You can test the parameters of any function execution on the response object.
   *
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @param {Object} params - An object representing an HttpRequest object.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithFunctionString))
      .debug({funcName: funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray))
      .debug({params: params}).test();

    this.HttpResponseMock[funcName] = this.HttpResponseMock[funcName] || function () {};
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    if (constants.ResponseEndFunctions[funcName]) {
      preconditions.checkArgument(!this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
        .debug({finishedHasBeenSet: this._finishedHasBeenSet_, responseFinishers: _.keys(constants.ResponseEndFunctions)}).test();

      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants.ResponseMockName, funcName);
      this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    }

    return this;
  }

  /**
   * This function is synonomous with the 'doesReturn' function except here we are defining what is returned from a mocked
   * function on the HTTP Response object. i.e. Defines what to return during a success scenario from a **synchronous**
   * mocked function on the HTTP Response object.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesReturn(funcName, dataToReturn) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName: constants.ResponseMockName, funcName}).test();

    this._mock_.doesReturn(constants.ResponseMockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function
   * on the HTTP Response Object. The dataToReturn will be returned on every execution of the mock. That means you only
   * need to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesAlwaysReturn(funcName, dataToReturn) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName: constants.ResponseMockName, funcName}).test();

    this._mock_.doesAlwaysReturn(constants.ResponseMockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * Some Http libraries in Node allow chainable functionality. For example, the following is a common express paradigm:
   * res.statusCode(200).send(result). To ensure Maddox allows a chainable interface like this, it allows the user to define
   * which functions should be chainable by using the 'resDoesReturnSelf'.  For the status code example, you would want
   * to add 'resDoesReturnSelf("statusCode")' to your scenario.
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @returns {HttpReqScenario}
   */
  resDoesReturnSelf(funcName) {
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.doesReturn(constants.ResponseMockName, funcName, this.HttpResponseMock, Mock.SynchronousType, false);
    return this;
  }

  test(done) {
    this._validate(done);

    preconditions.shouldBeDefined(this._inputParams_, ErrorFactory.build(constants.errorMessages.HttpReqUndefined))
      .debug({inputParams: this._inputParams_}).test();
    preconditions.checkArgument(this._finishedHasBeenSet_, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
      .debug({responseFinishers: _.keys(constants.ResponseEndFunctions)}).test();

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
      this._executeTest_().then(function () {
        this._mock_.test();
        resolve();
      }.bind(this)).catch(function (err) {
        reject(err);
      });

    }.bind(this));
  }

  _executePerfTest_() {
    return new Promise((resolve) => {
      if (this._shouldExecutePerformanceTest_()) {
        let suite = new Benchmark.Suite();

        suite.add(this._perfTitle_, {
          defer: true,
          fn: (deferred) => {

            this._mock_.setCallbackForResponseEnd(() => {
              this._resetScenario_();
              deferred.resolve();
            });

            this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
          }

        }).on("complete", (result) => {
          ReportProxy.addNewReport(this._perfTitle_, result);

          resolve();
        }).run();
      } else {
        resolve();
      }
    });
  }

  _executeTest_() {
    return new Promise((resolve) => {
      this._mock_.setCallbackForResponseEnd(resolve);

      this._inputParams_.push(this.HttpResponseMock);

      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    });
  }
}

module.exports = HttpReqScenario;
