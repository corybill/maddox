"use strict";

const constants = require("../constants"),
  ErrorFactory = require("../plugins/error-factory");

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
    this.tester = tester;
    this.hasTestFinisherBeenExecuted = false;
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
    callback.apply(this, mockedData.dataToReturn);
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

  shouldAlwaysBeIgnored(mockName, funcName) {
    preconditions.shouldBeDefined(this._mocks_[mockName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]))
        .shouldBeDefined(this._mocks_[mockName][funcName], ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [mockName, funcName]));

    this._mocks_[mockName][funcName].shouldAlwaysBeIgnored = true;
  }

  setResponseEndFunction(mockName, funcName, iteration) {
    iteration = iteration || 0;

    this._mocks_[mockName][funcName].responseEnd = true;
    this._mocks_[mockName][funcName].iteration = iteration;
  }

  clearAllResponseEndFunction() {
    _.forEach(this._mocks_, function (mockedFunctions, mockName) {
      _.forEach(mockedFunctions, function (mockedFunction, funcName) {

        delete this._mocks_[mockName][funcName].responseEnd;
        delete this._mocks_[mockName][funcName].iteration;

      }.bind(this));
    }.bind(this));
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
      const argsArr = Array.prototype.slice.call(arguments); // need to do this otherwise clone deep does not carry over the length property of the arguments object
      const args = _.cloneDeep(argsArr); // clones the arguments so that the mock will have them in the state when they were called regardless if they get modified by the code later on.
      const mock = this._mocks_[mockName][funcName];
      const mockedData = mock.doesAlwaysReturn || mock.doesReturn[mock.callCount];

      // Stop recording results after test finisher has been executed.
      if (!this.hasTestFinisherBeenExecuted) {
        mock.actual.push(args);

        preconditions.shouldBeDefined(mockedData, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]))
          .shouldBeDefined(mockedData.dataToReturn, ErrorFactory.build(constants.errorMessages.MissingMockedData, [ordinalValues[mock.callCount], mockName, funcName]));
      }

      if (mock.responseEnd && mock.iteration === mock.callCount && !this.hasTestFinisherBeenExecuted) {
        this.hasTestFinisherBeenExecuted = true;
        if (this.resolveForResponseEnd) {
          this.resolveForResponseEnd();
        }
      }

      mock.callCount = mock.callCount + 1;

      // This execution will call one of these three functions synchronousResult, callbackResult, or promiseResult.
      const mockedResult = this[mockedData.dataReturnType](mockName, funcName, mockedData, args);

      return mockedResult;
    }.bind(this));
  }

  wasFinisherFunctionExecuted() {
    return this.hasTestFinisherBeenExecuted;
  }

  setCallbackForResponseEnd(resolveForResponseEnd) {
    this.resolveForResponseEnd = resolveForResponseEnd;
  }

  noDebug() {
    this._noDebug_ = true;
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
        expectedResultsFromShouldAlways = mockedFunction.expectedAlways,
        shouldAlwaysBeIgnored = mockedFunction.shouldAlwaysBeIgnored;

      if (shouldAlwaysBeIgnored) {
        return;
      }

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

          funcName = (mockName === constants.ResponseMockName) ? `${funcName} (i.e. res.${funcName})` : funcName;

          let message = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, [paramOrdinalValue, mockName, funcName, countOrdinalValue]);

          if (expectedParamResult !== constants.IgnoreParam) {
            this.tester.shouldEqual({
              actual: actualParamResult,
              expected: expectedParamResult,
              message: message,
              usingShouldAlways: usingShouldAlways,
              noDebug: this._noDebug_
            });
          }

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
}

Mock.PromiseType = "promiseResult";
Mock.CallbackType = "callbackResult";
Mock.SynchronousType = "synchronousResult";

module.exports = Mock;
