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

  mockThisFunction(mockName, funcName, object) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.MockThisFunctionMockString))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.MockThisFunctionString))
      .debug({funcName: funcName}).test();
    preconditions.shouldBeObject(object, ErrorFactory.build(constants.errorMessages.MockThisFunctionObject))
      .debug({object: object}).test();

    this._mock_.mockThisFunction(mockName, funcName, object);
    return this;
  }

  withEntryPoint(entryPointObject, entryPointFunction) {
    preconditions.shouldBeObject(entryPointObject, ErrorFactory.build(constants.errorMessages.EntryPointObject))
      .debug({entryPointObject: entryPointObject}).test();
    preconditions.shouldBeString(entryPointFunction, ErrorFactory.build(constants.errorMessages.EntryPointString))
      .debug({entryPointFunction: entryPointFunction}).test();
    preconditions.shouldBeFunction(entryPointObject[entryPointFunction], ErrorFactory.build(constants.errorMessages.EntryPointFunction))
      .debug({entryPointObject: entryPointObject, entryPointFunction: entryPointFunction}).test();

    this._entryPointObject_ = entryPointObject;
    this._entryPointFunction_ = entryPointObject[entryPointFunction];
    return this;
  }

  withInputParams(inputParamsIn) {
    preconditions.shouldBeArray(inputParamsIn, ErrorFactory.build(constants.errorMessages.InputParamsArray))
      .debug({inputParamsIn: inputParamsIn}).test();
    this._inputParams_ = inputParamsIn;
    return this;
  }

  withHttpRequest(request) {
    preconditions.shouldBeArray(request, ErrorFactory.build(constants.errorMessages.HttpRequestArray))
      .debug({request: request}).test();
    this._inputParams_ = request;
    return this;
  }

  shouldBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .debug({funcName: funcName}).test();
    preconditions.shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray))
      .debug({params: params}).test();

    this._mock_.shouldBeCalledWith(mockName, funcName, params);
    return this;
  }

  doesReturn(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, false);
    return this;
  }

  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, false);
    return this;
  }

  doesError(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, true);
    return this;
  }

  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, true);
    return this;
  }

  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackMockName))
      .debug({mockName: mockName}).test();
    preconditions.shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackFuncName))
      .debug({funcName: funcName}).test();

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, true);
    return this;
  }

  validate(done) {
    preconditions.shouldBeFunction(done, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({done: done}).test();
    preconditions.shouldBeDefined(this._entryPointObject_, ErrorFactory.build(constants.errorMessages.MissingEntryPoint))
      .debug({_entryPointObject_: this._entryPointObject_}).test();
  }

  debug() {
    this._mock_.debug();
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
}

module.exports = Scenario;
