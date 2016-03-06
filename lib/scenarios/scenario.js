"use strict";

const Mocha = require("../test-frameworks/mocha/mocha"),
  Mock = require("./../mocks/mock"),
  constants = require("../constants"),
  ErrorFactory = require("../plugins/error-factory");

const Preconditions = require("preconditions");

const preconditions = Preconditions.singleton();

class Scenario {

  constructor() {
    this._tester_ = Mocha;
    this._mock_ = new Mock(this._tester_);
  }

  mockThisFunction(mockName, funcName, object) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.MockThisFunctionMockString))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.MockThisFunctionString))
      .shouldBeObject(object, ErrorFactory.build(constants.errorMessages.MockThisFunctionObject));

    this._mock_.mockThisFunction(mockName, funcName, object);
    return this;
  }

  withEntryPoint(entryPointObject, entryPointFunction) {
    preconditions.shouldBeObject(entryPointObject, ErrorFactory.build(constants.errorMessages.EntryPointObject))
      .shouldBeString(entryPointFunction, ErrorFactory.build(constants.errorMessages.EntryPointString))
      .shouldBeFunction(entryPointObject[entryPointFunction], ErrorFactory.build(constants.errorMessages.EntryPointFunction));

    this._entryPointObject_ = entryPointObject;
    this._entryPointFunction_ = entryPointObject[entryPointFunction];
    return this;
  }

  withInputParams(inputParamsIn) {
    preconditions.shouldBeArray(inputParamsIn, ErrorFactory.build(constants.errorMessages.InputParamsArray));
    this._inputParams_ = inputParamsIn;
    return this;
  }

  withHttpRequest(request) {
    preconditions.shouldBeArray(request, ErrorFactory.build(constants.errorMessages.HttpRequestArray));
    this._inputParams_ = request;
    return this;
  }

  shouldBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString))
      .shouldBeArray(params, ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray));

    this._mock_.shouldBeCalledWith(mockName, funcName, params);
    return this;
  }

  doesReturn(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, false);
    return this;
  }

  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnPromiseFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, false);
    return this;
  }

  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesReturnCallbackFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, false);
    return this;
  }

  doesError(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.SynchronousType, true);
    return this;
  }

  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorPromiseFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.PromiseType, true);
    return this;
  }

  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    preconditions.shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackMockName))
      .shouldBeString(funcName, ErrorFactory.build(constants.errorMessages.DoesErrorCallbackFuncName));

    this._mock_.doesReturn(mockName, funcName, dataToReturn, Mock.CallbackType, true);
    return this;
  }

  _restoreMocks_() {
    this._mock_.restoreMocks();
  }
}

module.exports = Scenario;
