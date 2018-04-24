"use strict";

const Promise = require("bluebird");
const Preconditions = require("preconditions");

const Mocha = require("../proxies/mocha-proxy");
const Mock = require("./../mocks/mock");
const constants = require("../constants");
const ErrorFactory = require("../plugins/error-factory");

const ExecuteTest = require("../steps/execute-test");
const WaitForTestFinisher = require("../steps/wait-for-test-finisher");
const TestMocks = require("../steps/test-mocks");
const ExecutePerf = require("../steps/execute-perf");
const FinishTest = require("../steps/finish-test");
const SkipTest = require("../steps/skip-test");
const HandleError = require("../steps/handle-error");

const preconditions = Preconditions.errr();

class Scenario {

  constructor(testContext) {
    this._tester_ = Mocha;
    this._mock_ = new Mock(this._tester_);

    this._flaggedForPerfTest_ = false;
    this._testableExecuted_ = false;
    this._foundMaddoxRuntimeError_ = false;
    this._usingManualFinisherFunction_ = false;

    this._inputParams_ = undefined;
    this._entryPointObject_ = undefined;
    this._entryPointFunction_ = undefined;
    this._testTitle_ = undefined;
    this._testResult_ = undefined;
    this._testRunnable_ = undefined;

    this._testContext_ = testContext;

    if (this._testContext_) {
      preconditions.shouldBeDefined(this._testContext_.skip, ErrorFactory.build(constants.errorMessages.IllegalMochaThisContext)).test();

      this.skipTest = this._testContext_.skip.bind(this._testContext_);
      this._testTitle_ = this._testContext_.test.fullTitle();
    }
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
   * Set a mocked proxy function as the finisher function for the test. When the finisher function is executed, the test
   * will be considered complete, the mocks will begin being tested, and then the provided testable function will be
   * executed. i.e. By setting this function, you are telling Maddox when the test is complete.
   *
   * A common use case for using this function, is if you want to execute a set of code asynchronously but you don't care
   * about the result. For Example: Let's say you want to call an HTTP endpoint to execute some code, but you want the
   * HTTP endpoint to provide an immediate acknowledgement. In other words, you want to end the HTTP Request without
   * waiting for the code behind the Http endpoint to be finished. Even though you want the HTTP request to finish
   * immediately, you still want to test that the other mocks are called with the expected parameters. Normally when using
   * the HttpReqScenario, your finisher function is automatically assigned within Maddox. Often the finisher function
   * will be res.send, because that is the function that is commonly used to finish Http Requests via Express. This
   * function will now tell Maddox that the execution is complete, and that Maddox can begin testing the mocks. By
   * setting a finisher function, you are now telling Maddox to wait until finisher function has been executed before
   * beginning to test the mocks.
   *
   * As always, there are detailed examples in the unit tests of Maddox to see how this can be used. But I will also be
   * publishing specific examples of this use case since it isn't that common.
   *
   * @param {String} mockName - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
   * @param {String} funcName - The name of the function to be mocked.
   * @param {Number} [iteration] - Defaults to 0. The finisher function will be executed the nth time this mocked proxy
   * function is executed. Iterations start at 0. So if you want the finisher function to called on the second time a
   * mocked proxy is called, then you would pass in 1.
   * @returns {Scenario}
   *
   */
  withTestFinisherFunction(mockName, funcName, iteration) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.MockThisFunctionMockString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.MockThisFunctionString))
      .debug({mockName, funcName}).test();

    this._mock_.clearAllResponseEndFunction();
    this._mock_.setResponseEndFunction(mockName, funcName, iteration);
    this._finishedHasBeenSet_ = true;
    this._usingManualFinisherFunction_ = true;
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
  shouldBeCalled(mockName, funcName) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledKeyString))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledFunctionString))
      .debug({mockName, funcName}).test();

    this._mock_.shouldBeCalled(mockName, funcName);
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
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesReturnDataToReturn))
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
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesReturnDataToReturn))
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
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseDataToReturn))
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
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseMockName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseFuncName))
      .debug({mockName, funcName}).test();
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseDataToReturn))
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
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesErrorDataToReturn))
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
    preconditions.shouldBeDefined(dataToReturn, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseDataToReturn))
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
  noDebug() {this._mock_.noDebug(); return this;}

  perf() {
    return this.performance();
  }

  performance() {
    preconditions.shouldBeDefined(this._testContext_, ErrorFactory.build(constants.errorMessages.MissingMochaTestContext)).test();

    this._flagAsPerfTest_();

    return this;
  }

  _resetScenario_() {this._mock_.restoreMockCallCounts();}

  _setError_(err) {this._err_ = err;}
  _setTestTitle_(testTitle) {this._testTitle_ = testTitle;}
  _flagAsPerfTest_() {this._flaggedForPerfTest_ = true;}
  _setTestResult_(testResult) {this._testResult_ = testResult;}
  _setTestable_(testable) {this._testable_ = testable;}
  _executingTestable_() {this._testableExecuted_ = true;}

  _getError_() {return this._err_;}
  _getTestTitle_() {return this._testTitle_;}
  _getTestResult_() {return this._testResult_;}
  _getInputParams_() {return this._inputParams_;}
  _getTestRunnable_() {return this._testRunnable_;}
  _getEntryPointFunction_() {return this._entryPointFunction_;}
  _getMock_() {return this._mock_;}
  _getTestable_() {return this._testable_;}
  _getPerfRunnable_() {return this._perfRunnable_;}
  _getScenarioType_() {return this._scenarioType_;}

  _shouldExecuteTest_() {return !process.maddox || process.maddox.perf !== true;}
  _shouldExecutePerfTest_() {return this._isPerformanceTest_() && this._flaggedForPerfTest_;}
  _isPerformanceTest_() {return process.maddox && process.maddox.perf === true;}

  _hasManualFinisherFunction_() {return this._usingManualFinisherFunction_;}

  _hasFinishedBeenSet_() {return this._finishedHasBeenSet_;}
  _hasTestableBeenExecuted_() {return this._testableExecuted_;}

  accept(step, err) {
    return Promise.try(() => {
      return step.next(this, err);
    });
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
   * @returns {Promise} - Nothing gets resolved on a successful resolution of this promise chain. But you can use the promise to handle errors thrown from the 'test' function to ensure you do not allow false positives.
   */
  test(testable) {
    this._validateScenario_(testable);
    this._setTestable_(testable);
    this._setTestRunnable_();
    this._setPerfRunnable_();

    return Promise.resolve()
      .then(() => this.accept(ExecuteTest))
      .then(() => this.accept(WaitForTestFinisher))
      .then(() => this.accept(TestMocks))
      .then(() => this.accept(ExecutePerf))
      .then(() => this.accept(SkipTest))
      .then(() => this.accept(FinishTest))
      .catch((err) => this.accept(HandleError, err));
  }
}

module.exports = Scenario;
