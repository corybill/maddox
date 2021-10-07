const Preconditions = require('preconditions'),
  Promise = require('bluebird');

const Scenario = require('./scenario'),
  Mock = require('../mocks/mock'),
  ErrorFactory = require('../plugins/error-factory'),
  constants = require('../constants');

const preconditions = Preconditions.errr();

class HttpReqScenario extends Scenario {
  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.HttpReqScenario;
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
      .debug({ request: request }).test();

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
      .debug({ funcName: funcName }).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray))
      .debug({ params: params }).test();

    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, params);

    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object that should be called with
   * the a superset of the expected parameters on a call to the Response Mock.
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters that are a subset of the actual parameters. First parameter
   * of the function goes in index 0 and the nth parameter of the function goes into index n.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalledWithSubset(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({ funcName }).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray))
      .debug({ funcName, params }).test();

    this._configureResponseMock_(funcName);

    this._mock_.shouldBeCalledWithSubset(constants.ResponseMockName, funcName, params);

    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object. This
   * check does not validate any parameters, it just validates that the function is called.
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalled(funcName) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({ funcName }).test();

    this._configureResponseMock_(funcName);

    this._mock_.shouldBeCalled(constants.ResponseMockName, funcName);

    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object that should be called with
   * the same expected parameters on every call to the Response Mock
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {HttpReqScenario}
   */
  resShouldAlwaysBeCalledWith(funcName, params) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({ funcName }).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray))
      .debug({ funcName, params }).test();

    this._configureResponseMock_(funcName);

    this._mock_.shouldAlwaysBeCalledWith(constants.ResponseMockName, funcName, params);

    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' specifically designed for Http Headers. This function mocks the 'set' function
   * (or the provided function name) on the response mock. This function should be used to set a header in the response.
   *
   * In Express, you use the following syntax for for setting a header 'res.set("headerKey", "headerValue");'.
   *
   * @param {String} headerName - The name of the header. i.e. The key.
   * @param {String} headerValue - The value of the header.
   * @param {String} [funcName] - Defaults to Expresses .set function.
   * @returns {HttpReqScenario}
   */
  resShouldContainHeader(headerName, headerValue, funcName) {
    preconditions.shouldBeString(headerName, ErrorFactory.build(constants.errorMessages.HeaderNameShouldBeString))
      .debug({ headerName, headerValue }).test();
    preconditions.shouldBeString(headerValue, ErrorFactory.build(constants.errorMessages.HeaderValueShouldBeString))
      .debug({ headerName, headerValue }).test();

    funcName = funcName || 'set';

    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalledWith(constants.ResponseMockName, funcName, [headerName, headerValue]);

    this.resDoesReturnSelf(funcName);

    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' that defines the parameters being passed into a given mocked function should never
   * be tested.
   *
   * I was hesitant to add this functionality as it can easily be abused. That being said, there are some valid use cases
   * but you should always think twice before using this function as you are essentially saying that you do not care
   * about testing this mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {HttpReqScenario}
   */
  resShouldAlwaysBeIgnored(funcName) {
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({ mockName: constants.ResponseMockName, funcName }).test();

    this._configureResponseMock_(funcName);
    this._mock_.shouldAlwaysBeIgnored(constants.ResponseMockName, funcName);
    return this;
  }

  /**
   * This function is synonymous with the 'doesReturn' function except here we are defining what is returned from a mocked
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
      .debug({ mockName: constants.ResponseMockName, funcName }).test();

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
      .debug({ mockName: constants.ResponseMockName, funcName }).test();

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

  _configureResponseMock_(funcName) {
    this.HttpResponseMock[funcName] = this.HttpResponseMock[funcName] || function () {};
    this._mock_.mockThisFunctionAtMostOnce(constants.ResponseMockName, funcName, this.HttpResponseMock);

    if (constants.ResponseEndFunctions[funcName] && !this._finishedHasBeenSet_) {
      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants.ResponseMockName, funcName);
    }

    if (constants.ResponseEndFunctions[funcName]) {
      this.resDoesReturnSelf(funcName);
    }
  }

  _setTestRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);

    this._testRunnable_ = () => {
      return new Promise((resolve) => {
        this._mock_.setCallbackForResponseEnd(resolve);

        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      });
    };
  }

  _setPerfRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);

    this._perfRunnable_ = (sampleDone) => {
      this._mock_.setCallbackForResponseEnd(() => {
        sampleDone();
      });

      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    };
  }

  _validateScenario_(testable) {
    const inputParams = this._getInputParams_();
    const entryPointFunction = this._getEntryPointFunction_();
    const hasFinisherBeenSet = this._hasFinishedBeenSet_();

    preconditions.shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({ testable }).test();

    preconditions.shouldBeDefined(entryPointFunction, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({ entryPointFunction }).test();

    preconditions.shouldBeDefined(inputParams, ErrorFactory.build(constants.errorMessages.HttpReqUndefined))
      .debug({ inputParams }).test();

    preconditions.checkArgument(hasFinisherBeenSet, ErrorFactory.build(constants.errorMessages.ExactlyOneResponseFinisher))
      .debug({ responseFinishers: Object.keys(constants.ResponseEndFunctions) }).test();

  }
}

module.exports = HttpReqScenario;
