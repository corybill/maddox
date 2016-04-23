"use strict";

const constants = require("../constants"),
  ErrorFactory = require("../plugins/error-factory"),
  Errr = require("errr");

const Promise = require("bluebird"),
  sinon = require("sinon"),
  Preconditions = require("preconditions"),
  _ = require("lodash");

const preconditions = Preconditions.singleton(),
  ordinalValues = constants.ordinalValues;

class Private {
  static _getNewMockInfo(objectToMock) {
    return {
      expected: [],
      actual: [],
      doesReturn: [],
      callCount: 0,
      objectToMock: objectToMock
    };
  }
}

class Mock {
  constructor(tester) {
    this._mocks_ = {};
    this._debugFailures_ = false;
    this.tester = tester;
  }

  restoreMocks() {
    _.forEach(this._mocks_, function (mockedFunctions, mockName) {
      _.forEach(mockedFunctions, function (mockedFunction, funcName) {

        if (this._mocks_[mockName][funcName].objectToMock[funcName].restore) {
          this._mocks_[mockName][funcName].objectToMock[funcName].restore();
        }

      }.bind(this));
    }.bind(this));
  }

  restoreMockCallCounts() {
    _.forEach(this._mocks_, function (mockedFunctions, mockName) {
      _.forEach(mockedFunctions, function (mockedFunction, funcName) {

        this._mocks_[mockName][funcName].callCount = 0;

      }.bind(this));
    }.bind(this));
  }

  promiseResult(mockName, funcName, mockedData) {
    return mockedData.isError ? Promise.reject(mockedData.dataToReturn) :
      Promise.resolve(mockedData.dataToReturn);
  }

  callbackResult(mockName, funcName, mockedData, args) {
    var callback = args[args.length - 1];

    preconditions.shouldBeFunction(callback, ErrorFactory.build(constants.errorMessages.MissingCallback, [mockName, funcName]));

    delete args[args.length - 1];

    if (mockedData.isError) {
      return callback(mockedData.dataToReturn, mockedData.dataToReturn);

    } else {
      return callback(undefined, mockedData.dataToReturn);
    }
  }

  synchronousResult(mockName, funcName, mockedData) {
    if (mockedData.isError) {
      throw mockedData.dataToReturn;
    } else {
      return mockedData.dataToReturn;
    }
  }

  doesReturn(mockName, funcName, dataToReturn, returnType, isError) {
    preconditions.shouldBeDefined(this._mocks_[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    this._mocks_[mockName][funcName].doesReturn.push({
      dataToReturn: dataToReturn,
      dataReturnType: returnType,
      isError: isError
    });
  }
  doesAlwaysReturn(mockName, funcName, dataToReturn, returnType, isError) {
    preconditions.shouldBeDefined(this._mocks_[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    this._mocks_[mockName][funcName].doesAlwaysReturn = {
      dataToReturn: dataToReturn,
      dataReturnType: returnType,
      isError: isError
    };
  }

  shouldBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeDefined(this._mocks_[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    var args = {};

    _.forEach(params, function (value, key) {
      args[key] = value;
    });

    this._mocks_[mockName][funcName].expected.push(args);
  }
  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    preconditions.shouldBeDefined(this._mocks_[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
      .shouldBeDefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    var args = {};

    _.forEach(params, function (value, key) {
      args[key] = value;
    });

    this._mocks_[mockName][funcName].expectedAlways = args;
  }

  setResponseEndFunction(mockName, funcName) {
    this._mocks_[mockName][funcName].responseEnd = true;
  }

  mockThisFunctionAtMostOnce(mockName, funcName, objectToMock) {
    if (!this._mocks_[mockName] || !this._mocks_[mockName][funcName]) {
      this.mockThisFunction(mockName, funcName, objectToMock);
    }
  }

  mockThisFunction(mockName, funcName, objectToMock) {
    preconditions.shouldBeDefined(objectToMock[funcName], ErrorFactory.build(constants.errorMessages.FunctionNotInMock, [funcName, mockName]));

    this._mocks_[mockName] = this._mocks_[mockName] || {};

    preconditions.shouldBeUndefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MockAlreadyExists, [mockName, funcName]));

    this._mocks_[mockName][funcName] = Private._getNewMockInfo(objectToMock);

    if (objectToMock[funcName].isSinonProxy) {
      objectToMock[funcName].restore();
    }

    sinon.stub(objectToMock, funcName, function () {
      let mockedResult,
        mock = this._mocks_[mockName][funcName];

      mock.actual.push(arguments);

      if (mock.responseEnd) {
        this.resolveForResponseEnd();

      } else {
        var mockedData = mock.doesAlwaysReturn || mock.doesReturn[mock.callCount];

        preconditions.shouldBeDefined(mockedData, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]))
          .shouldBeDefined(mockedData.dataToReturn, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]));

        mock.callCount = mock.callCount + 1;

        // This execution will call one of these three functions synchronousResult, callbackResult, or promiseResult.
        mockedResult = this[mockedData.dataReturnType](mockName, funcName, mockedData, arguments);
      }

      return mockedResult;
    }.bind(this));
  }

  setCallbackForResponseEnd(resolveForResponseEnd) {
    this.resolveForResponseEnd = resolveForResponseEnd;
  }

  debug() {
    this._debugFailures_ = true;
  }

  test() {
    // Always verify the response mock first since it could contain a runtime error message.
    this._responseMocks_ = this._mocks_[constants.ResponseMockName];
    this.testMock(this._responseMocks_, constants.ResponseMockName);
    delete this._mocks_[constants.ResponseMockName];

    // LOOPING THROUGH MOCKS
    _.forEach(this._mocks_, function (mockedFunctions, mockName) {
      this.testMock(mockedFunctions, mockName);
    }.bind(this));

    // Add back response mocks so perf tests can use them.
    this._mocks_[constants.ResponseMockName] = this._responseMocks_;
  }

  testMock(mockedFunctions, mockName) {
    // LOOPING THROUGH FUNCTIONS IN THE MOCKS
    _.forEach(mockedFunctions, function (mockedFunction, funcName) {
      let actualResults = mockedFunction.actual,
        expectedResults = mockedFunction.expected,
        expectedResultsFromShouldAlways = mockedFunction.expectedAlways;

      // ONLY CHECK NUMBER OF CALLS LENGTH IF 'expectedResultsFromShouldAlways' HAS NOT BEEN SET.
      if (!expectedResultsFromShouldAlways) {
        preconditions.checkArgument((actualResults.length === expectedResults.length), ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, [mockName, funcName, expectedResults.length, actualResults.length]));
      }

      // LOOPING THROUGH ACTUAL RESULTS BY FUNCTION
      _.forEach(actualResults, function (actualResult, actualResultIndex) {
        let countOrdinalValue = ordinalValues[actualResultIndex] || actualResultIndex,
          expectedResult = expectedResultsFromShouldAlways || expectedResults[actualResultIndex],
          numActualParams = 0, numExpectedParams = 0;

        // LOOPING THROUGH PARAMETERS OF A SINGLE ACTUAL RESULT
        _.forEach(actualResult, function (actualParamResult, actualParamResultIndex) {
          if (actualParamResult) {
            numActualParams++;
          }

          let paramOrdinalValue = ordinalValues[actualParamResultIndex] || actualResultIndex,
            expectedParamResult, usingShouldAlways;

          if (expectedResultsFromShouldAlways && expectedResultsFromShouldAlways[actualParamResultIndex]) {
            expectedParamResult = expectedResultsFromShouldAlways[actualParamResultIndex];
            usingShouldAlways = true;
          } else {
            expectedParamResult = (expectedResult) ? expectedResult[actualParamResultIndex] : expectedResult;
            usingShouldAlways = false;
          }

          let message = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, [paramOrdinalValue, mockName, funcName, countOrdinalValue]);

          this.compare(actualParamResult, expectedParamResult, usingShouldAlways, message);
        }.bind(this));

        _.forEach(expectedResult, function (expectedParamResult) {
          if (expectedParamResult) {
            numExpectedParams++;
          }
        });

        preconditions.checkArgument(numActualParams === numExpectedParams, ErrorFactory.build(constants.errorMessages.WrongNumberOfParams, [countOrdinalValue, mockName, funcName, numExpectedParams, numActualParams]));

      }.bind(this));
    }.bind(this));
  }

  compare(actual, expected, usingShouldAlways, message) {
    try {
      this.tester.shouldEqual(actual, expected, message);
    } catch (err) {
      let throwable = (this._debugFailures_) ? Errr.newError(err.message)
        .debug({actual: actual, expected: expected, usingShouldAlways: usingShouldAlways})
        .appendTo(err).get() : err;

      throw throwable;
    }
  }
}

Mock.PromiseType = "promiseResult";
Mock.CallbackType = "callbackResult";
Mock.SynchronousType = "synchronousResult";

module.exports = Mock;
