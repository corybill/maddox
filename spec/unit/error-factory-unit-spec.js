"use strict";

const ErrorFactory = require("../../lib/plugins/error-factory"),
  constants = require("../../lib/constants"),
  random = require("../random"),
  Maddox = require("../../lib/index"); // require("maddox")

const chai = require("chai");

const Scenario = Maddox.functional.FromSynchronousScenario,
  expect = chai.expect;

describe("When using the error-factory", function () {
  let errorContext;

  beforeEach(function () {
    errorContext = {};
    errorContext.setupTest = function () {
      errorContext.entryPointObject = ErrorFactory;
      errorContext.entryPointFunction = "build";
    };
  });

  // TODO: Test all error message generation to make sure it is exactly correct.

  // DoesErrorCallbackMockName 1021
  it("it should generate correct 'DoesErrorCallbackMockName' error message", function (done) {
    errorContext.setupInput = function () {
      errorContext.inputParams = [constants.errorMessages.DoesErrorCallbackMockName];
    };
    errorContext.setupExpected = function () {
      errorContext.expectedResponse = "Maddox Scenario Build Error (1021): When calling 'doesErrorWithCallback', the first parameter must be of type String representing the mock key.";
    };

    errorContext.setupTest();
    errorContext.setupInput();
    errorContext.setupExpected();

    new Scenario()
      .withEntryPoint(errorContext.entryPointObject, errorContext.entryPointFunction)
      .withInputParams(errorContext.inputParams)
      .test(function (err, result) {
        try {
          if (err) {
            done(err);

          } else {
            expect(result).eql(errorContext.expectedResponse);
            done();
          }
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MissingCallback 3000
  it("it should generate correct 'MissingCallback' error message", function (done) {
    errorContext.setupInput = function () {
      errorContext.mockName = random.word();
      errorContext.funcName = random.word();
      errorContext.callCount = random.zip();

      errorContext.inputParams = [constants.errorMessages.MissingCallback, [errorContext.mockName, errorContext.funcName]];
    };
    errorContext.setupExpected = function () {
      errorContext.expectedResponse = `Maddox Runtime Error (3000): When using 'doesReturnWithCallback' or 'doesErrorWithCallback' for ${errorContext.mockName}.${errorContext.funcName} the last parameter in the function must be the callback function.`;
    };

    errorContext.setupTest();
    errorContext.setupInput();
    errorContext.setupExpected();

    new Scenario()
      .withEntryPoint(errorContext.entryPointObject, errorContext.entryPointFunction)
      .withInputParams(errorContext.inputParams)
      .test(function (err, result) {
        try {
          if (err) {
            done(err);
          } else {
            expect(result).eql(errorContext.expectedResponse);
            done();
          }
        } catch (testError) {
          done(testError);
        }
      });
  });
});
