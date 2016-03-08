"use strict";

const constants = require("../constants"),
  ErrorFactory = require("../plugins/error-factory");

const Promise = require("bluebird"),
  sinon = require("sinon"),
  Preconditions = require("preconditions"),
  _ = require("lodash");

const preconditions = Preconditions.singleton(),
  ordinalValues = constants.ordinalValues;

function BaseMock(tester) {
  var mocks = {};

  this.tester = tester;

  this.restoreMocks = function () {
    _.forEach(mocks, function (mockedFunctions, mockName) {
      _.forEach(mockedFunctions, function (mockedFunction, funcName) {
        if (mocks[mockName][funcName].objectToMock[funcName].restore) {
          mocks[mockName][funcName].objectToMock[funcName].restore();
        }
      });
    });
  };
  this.restoreMockCallCounts = function () {
    _.forEach(mocks, function (mockedFunctions, mockName) {
      _.forEach(mockedFunctions, function (mockedFunction, funcName) {
        mocks[mockName][funcName].callCount = 0;
      });
    });
  };

  this.promiseResult = function (mockName, funcName, mockedData) {
    return mockedData.isError ? Promise.reject(mockedData.dataToReturn) :
      Promise.resolve(mockedData.dataToReturn);
  };

  this.callbackResult = function (mockName, funcName, mockedData, args) {
    var callback = args[args.length - 1];

    preconditions.shouldBeFunction(callback, ErrorFactory.build(constants.errorMessages.MissingCallback, [mockName, funcName]));

    delete args[args.length - 1];

    if (mockedData.isError) {
      return callback(mockedData.dataToReturn, mockedData.dataToReturn);

    } else {
      return callback(undefined, mockedData.dataToReturn);
    }
  };

  this.synchronousResult = function (mockName, funcName, mockedData) {
    if (mockedData.isError) {
      throw mockedData.dataToReturn;
    } else {
      return mockedData.dataToReturn;
    }
  };

  this.doesReturn = function (mockName, funcName, dataToReturn, returnType, isError) {
    preconditions.shouldBeDefined(mocks[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(mocks[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    mocks[mockName][funcName].doesReturn.push({
      dataToReturn: dataToReturn,
      dataReturnType: returnType,
      isError: isError
    });
  };

  this.shouldBeCalledWith = function (mockName, funcName, params) {
    preconditions.shouldBeDefined(mocks[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(mocks[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    var args = {};

    _.forEach(params, function (value, key) {
      args[key] = value;
    });

    mocks[mockName][funcName].expected.push(args);
  };

  this.setResponseEndFunction = function (mockName, funcName) {
    mocks[mockName][funcName].responseEnd = true;
  };

  this.mockThisFunctionAtMostOnce = function (mockName, funcName, objectToMock) {
    if (!mocks[mockName] || !mocks[mockName][funcName]) {
      this.mockThisFunction(mockName, funcName, objectToMock);
    }
  };

  this.mockThisFunction = function (mockName, funcName, objectToMock) {
    preconditions.shouldBeDefined(objectToMock[funcName], ErrorFactory.build(constants.errorMessages.FunctionNotInMock, [funcName, mockName]));

    mocks[mockName] = mocks[mockName] || {};

    preconditions.shouldBeUndefined(mocks[mockName][funcName], ErrorFactory.build(constants.errorMessages.MockAlreadyExists, [mockName, funcName]));

    mocks[mockName][funcName] = _getNewMockInfo(objectToMock);

    sinon.stub(objectToMock, funcName, function () {
      let mockedResult,
        mock = mocks[mockName][funcName];

      if (mock.responseEnd) {
        mock.actual.push(arguments);
        this.resolveForResponseEnd();

      } else {
        var mockedData = mock.doesReturn[mock.callCount];

        preconditions.shouldBeDefined(mockedData, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]))
          .shouldBeDefined(mockedData.dataToReturn, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]));

        mock.actual.push(arguments);

        // This execution will call one of these three functions synchronousResult, callbackResult, or promiseResult.
        mockedResult = this[mockedData.dataReturnType](mockName, funcName, mockedData, arguments);

        mock.callCount++;
      }

      return mockedResult;
    }.bind(this));
  };

  this.setCallbackForResponseEnd = function (resolveForResponseEnd) {
    this.resolveForResponseEnd = resolveForResponseEnd;
  };

  this.getMocks = function () {
    return mocks;
  };
}

function _getNewMockInfo(objectToMock) {
  return {
    expected: [],
    actual: [],
    doesReturn: [],
    callCount: 0,
    objectToMock: objectToMock
  };
}

BaseMock.PromiseType = "promiseResult";
BaseMock.CallbackType = "callbackResult";
BaseMock.SynchronousType = "synchronousResult";

BaseMock.prototype.test = function () {
  let mocks = this.getMocks();

  // Always verify the response mock first since it could contain a runtime error message.
  this._responseMocks_ = mocks[constants.ResponseMockName];
  this.testMock(this._responseMocks_, constants.ResponseMockName);
  delete mocks[constants.ResponseMockName];

  // LOOPING THROUGH MOCKS
  _.forEach(mocks, function (mockedFunctions, mockName) {
    this.testMock(mockedFunctions, mockName);
  }.bind(this));

  // Add back response mocks so perf tests can use them.
  mocks[constants.ResponseMockName] = this._responseMocks_;
};

BaseMock.prototype.testMock = function (mockedFunctions, mockName) {
// LOOPING THROUGH FUNCTIONS IN THE MOCKS
  _.forEach(mockedFunctions, function (mockedFunction, funcName) {
    var actualByFuncName = mockedFunction.actual;
    var expectedByFuncName = mockedFunction.expected;

    preconditions.checkArgument((actualByFuncName.length === expectedByFuncName.length), ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, [mockName, funcName, expectedByFuncName.length, actualByFuncName.length]));

    // LOOPING THROUGH ACTUAL RESULTS BY FUNCTION
    for (var i = 0; i < actualByFuncName.length; i++) {
      var countOrdinalValue = ordinalValues[i] || i;

      // LOOPING THROUGH PARAMETERS OF ACTUAL RESULTS
      for (var paramKey in actualByFuncName[i]) {
        if (actualByFuncName[i].hasOwnProperty(paramKey)) {
          var paramOrdinalValue = ordinalValues[paramKey] || i;

          let message = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, [paramOrdinalValue, mockName, funcName, countOrdinalValue]);

          this.tester.shouldEqual(actualByFuncName[i][paramKey], expectedByFuncName[i][paramKey], message);
        }
      }
    }

  }.bind(this));
};

module.exports = BaseMock;
