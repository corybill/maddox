"use strict";

const Mocha = require("../proxies/mocha-proxy"),
  Mock = require("./../mocks/mock"),
  constants = require("../constants"),
  ErrorFactory = require("../plugins/error-factory");

const Preconditions = require("preconditions");

const preconditions = Preconditions.errr();

class Scenario {

  constructor() {
    this._tester_ = Mocha;
    this._mock_ = new Mock(this._tester_);
    this._flaggedForPerfTest_ = false;
  }

  /**
   * Mock any function from a given object.  The most common use case would be to mock out a function in your proxy layer.
   *
   * @param {String} mockName - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
   * @param {String} funcName - The name of the function to be mocked.
   * @param {Object} object - The object that contains the function to be mocked.
   * @returns {Scenario}
   */
  mockThisFunction(mockName, funcName, object) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.MockThisFunctionMockString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.MockThisFunctionString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeObject(object, ErrorFactory.build(constants.errorMessages.MockThisFunctionObject))
      .debug({mockName, funcName, object}).test();

    this._mock_.mockThisFunction(mockName, funcName, object);
    return this;
  }

  /**
   * Defines where to begin the test.
   *
   * @param {Object} entryPointObject - The object to start the test from.
   * @param {String} entryPointFunction - The function within the object to start the test from.
   * @returns {Scenario}
   */
  withEntryPoint(entryPointObject, entryPointFunction) {
    preconditions.shouldBeObject(entryPointObject, ErrorFactory.build(constants.errorMessages.EntryPointObject))
      .debug({entryPointObject, entryPointFunction}).test();
    preconditions.shouldBeString(entryPointFunction, ErrorFactory.build(constants.errorMessages.EntryPointString))
      .debug({entryPointObject, entryPointFunction}).test();
    preconditions.shouldBeFunction(entryPointObject[entryPointFunction], ErrorFactory.build(constants.errorMessages.EntryPointFunction))
      .debug({entryPointObject, entryPointFunction}).test();

    this._entryPointObject_ = entryPointObject;
    this._entryPointFunction_ = entryPointObject[entryPointFunction];
    return this;
  }

  /**
   * These are the input params into the function that you would like to test. The input params is an array representation
   * of all the parameters.
   *
   * @param {Array} inputParamsIn - Array of parameters. The first function parameter goes into index 0 and the nth parameter goes into index n.
   * @returns {Scenario}
   */
  withInputParams(inputParamsIn) {
    preconditions.shouldBeArray(inputParamsIn, ErrorFactory.build(constants.errorMessages.InputParamsArray))
      .debug({inputParamsIn: inputParamsIn}).test();
    this._inputParams_ = inputParamsIn;
    return this;
  }

  /**
   * Defines an expectation for a mocked function. i.e. after your test is complete, Maddox will compare the actual
   * parameters the mock was called with to the defined exepected parameters from this function.  If a mocked function
   * (from 'mockThisFunction') is called once, then 'shouldBeCalledWith' should be defined once for that mocked function.
   * If a mocked function is called 'n' times, then 'shouldBeCalledWith' should be defined 'n' times for that mocked function.
   *
   * Ordering matters when defining these expectations. If your function is called 3 times, Maddox will compare the first
   * set of actual parameters to the first set of defined expected parameters and so on.
   *
   * If your function takes a callback you should NOT add this to the params array. The callback will be automatically
   * validated during execution when you use 'doesReturnWithCallback'.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray))
      .debug({mockName, funcName, params}).test();

    this._mock_.shouldBeCalledWith(mockName, funcName, params);
    return this;
  }

  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function should be called with the same expected parameters
   * on every call to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray))
      .debug({mockName, funcName, params}).test();

    this._mock_.shouldAlwaysBeCalledWith(mockName, funcName, params);
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
   * @returns {Scenario}
   */
  shouldAlwaysBeIgnored(mockName, funcName) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({mockName, funcName}).test();

    this._mock_.shouldAlwaysBeIgnored(mockName, funcName);
    return this;
  }

  /**
   * Defines what to return during a success scenario from a **synchronous** mocked function.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  doesReturn(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function. The dataToReturn will be
   * returned on every execution of the mock. That means you only need to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  doesAlwaysReturn(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that
   * returns a **promise**.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed. This data will
   * be available in the next step of your promise chain.
   * @returns {Scenario}
   */
  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that
   * returns a **promise**. The dataToReturn will be returned on every execution of the mock. That means you only need
   * to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed. This data will
   * be available in the next step of your promise chain.
   * @returns {Scenario}
   */
  doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, Mock.PromiseType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario
   * that expects results to be returned in a **callback**.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be
   * added in the callback function.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} dataToReturn - An array of parameters that will be applied (.apply) to the provided callback function.
   * @returns {Scenario}
   */
  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = (Object.is(JSON.stringify(dataToReturn, null, 2), "{}")) ? [] : dataToReturn;

    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackFuncName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeArray(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackDataToReturn))
      .debug({mockName, funcName, dataToReturn}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario
   * that expects results to be returned in a **callback**. The dataToReturn will be returned on every execution of the
   * mock. That means you only need to define one return value for all calls to the mock.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be
   * added in the callback function.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} dataToReturn - An array of parameters that will be applied (.apply) to the provided callback function.
   * @returns {Scenario}
   */
  doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = (Object.is(JSON.stringify(dataToReturn, null, 2), "{}")) ? [] : dataToReturn;

    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackFuncName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeArray(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesAlwaysReturnCallbackDataToReturn))
      .debug({mockName, funcName, dataToReturn}).test();

    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, Mock.CallbackType, false);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. Defines what to return during a failure scenario from a **synchronous** mocked
   * function. To force the error scenario, the mocked function will throw the dataToReturn. Best practice dictates
   * that you only throw Javascript Error objects. Therefore, you should be providing a Node Error object in the
   * dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be thrown.
   * @returns {Scenario}
   */
  doesError(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, true);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that
   * returns a **promise**. To force the error scenario, the mocked function will reject using the dataToReturn causing
   * the first catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript
   * Error objects. Therefore, you should be providing a Node Error object in the dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be rejected.
   * @returns {Scenario}
   */
  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseFuncName))
      .debug({mockName, funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, true);
    return this;
  }

  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario
   * that expects results to be returned in a **callback**. There is absolutely no difference between 'doesErrorWithCallback'
   * and 'doesReturnWithCallback'. It is instead up to user to define the response parameters in the dataToReturn
   * array. In other words, if you want an error scenario, you just need to ensure the err object is defined in your
   * dataToReturn array of parameters.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that
   * returns a **promise**. To force the error scenario, the mocked function will throw the dataToReturn causing the first
   * catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript Error
   * objects. Therefore, you should be providing a Node Error object in the dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be passed into .
   * @returns {Scenario}
   */
  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = (Object.is(JSON.stringify(dataToReturn, null, 2), "{}")) ? [] : dataToReturn;

    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackFuncName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeArray(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackDataToReturn))
      .debug({mockName, funcName, dataToReturn}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, true);
    return this;
  }

  _validate(done) {
    preconditions.shouldBeFunction(done, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({done: done}).test();
    preconditions.shouldBeDefined(this._entryPointObject_, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({_entryPointObject_: this._entryPointObject_}).test();
  }

  /**
   * By default, when a comparison fails, Maddox will place a stringified version of the actual and expected results
   * into the stack trace so the user can see what is wrong.  When noDebug is added to a scenario, Maddox will no longer
   * provide the expected and actual in the stack trace debug params.
   * @returns {Scenario}
   */
  noDebug() {
    this._mock_.noDebug();
    return this;
  }

  perf(title) {
    this._flaggedForPerfTest_ = true;
    this._perfTitle_ = title;

    return this;
  }

  _restoreMocks_() {
    this._mock_.restoreMocks();
  }

  _resetScenario_() {
    this._mock_.restoreMockCallCounts();
  }

  _shouldExecuteFunctionalTest_() {
    return process.env.test !== "false";
  }

  _shouldExecutePerformanceTest_() {
    return (process.env.perf && process.env.perf === "true" && this._flaggedForPerfTest_);
  }

  /**
   * Initiates the test. This will call the entry point function with given input params. When the function is done
   * executing, it will test that all of mocked functions were called with the expected parameters, and then call the
   * testable function that was the parameter for the test function.
   *
   * If testing the HttpReqScenario, Maddox call into the controller function using your input params as the request and
   * mocking out the response for you. When a response finishing function (i.e. send, json, end, etc) is called on the
   * response object, Maddox will begin validating the request. It will first test that all functions mocked on the response
   * were called with the expected values. Next it will test that all of mocked functions were called with the expected
   * parameters. And finally it will call function that was the parameter for the test function. Usually for the
   * HttpReqScenario, you can just pass in the 'done' function from your testing framework.
   *
   * @param {Function} testable - A function to test or to end the test.  This function will be called with two parameters,
   * err and result. In other words, 'testable(err, result)'.
   * @returns nothing
   */
  test() {}
}

module.exports = Scenario;
