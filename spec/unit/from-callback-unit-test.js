"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/from-callback-controller"),
  testConstants = require("../test-constants"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy");

const Scenario = Maddox.functional.FromCallbackScenario;

describe("FromCallbackScenario", function () {
  let testContext;

  beforeEach(function () {
    testContext = {};

    testContext.setupTest = function () {
      testContext.entryPointObject = Controller;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };

    testContext.setupInputParams = function () {
      testContext.httpRequest = {
        params: {
          personId: "123456789"
        },
        query: {
          homeState: "IL"
        }
      };

      testContext.inputParams = [testContext.httpRequest];
    };

    testContext.setupGetFirstName = function () {
      testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
      testContext.getFirstName1Result = random.firstName();

      testContext.getFirstName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
      testContext.getFirstName2Result = random.firstName();
    };

    testContext.setupGetMiddleName = function () {
      testContext.getMiddleNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result];
      testContext.getMiddleNameResult = random.firstName();
    };

    testContext.setupGetLastName = function () {
      testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
      testContext.getLastNameResult = [undefined, random.lastName()];
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = {
        personId: testContext.httpRequest.params.personId,
        homeState: testContext.httpRequest.query.homeState,
        lastName: testContext.getLastNameResult[1]
      };

      testContext.expectedStatusCode = [200];
    };
  });

  it("it should handle a successful request.", function (done) {
    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();

    new Scenario(this)
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

      .perf()
      .test(function (err, response) {
        try {
          Maddox.compare.shouldEqual({actual: err, expected: undefined});
          Maddox.compare.shouldEqual({actual: response, expected: testContext.expectedResponse});
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  it("it should handle a checked exception.", function (done) {
    testContext.setupInputParams = function () {
      testContext.httpRequest = {
        params: {},
        query: {
          homeState: "IL"
        }
      };

      testContext.inputParams = [testContext.httpRequest];
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = testConstants.MissingPersonIdParam;

      testContext.expectedStatusCode = [404];
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();

    new Scenario(this)
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .test(function (err, response) {
        try {
          Maddox.compare.shouldEqual({actual: err.message, expected: testContext.expectedResponse});
          Maddox.compare.shouldEqual({actual: response, expected: undefined});
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });
});
