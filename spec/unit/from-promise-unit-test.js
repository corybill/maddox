"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/from-promise-controller"),
  testConstants = require("../test-constants"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy");

const Scenario = Maddox.functional.FromPromiseScenario;

describe("Given the FromPromiseScenario", function () {
  let testContext;

  describe("When using the FromPromiseScenario, it", function () {
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
      };
    });

    it("should handle a successful request.", function (done) {
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

    it("should handle a checked exception.", function (done) {
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

    it("should not test mocks that come after finisher function.", function (done) {
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
        .withTestFinisherFunction("proxyInstance", "getFirstName", 1)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        // Don't need a shouldBeCalledWith because it never gets called
        // .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        // Don't need a shouldBeCalledWith because it never gets called
        // .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

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
  });

  describe("when initiating an async process and using a finisher function, it", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "initiateAsyncProcessing";
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
          result: "OK"
        };
      };
    });

    it("should still test Response if it happens before the finisher function is executed.", function (done) {
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
        .withTestFinisherFunction("proxyInstance", "getLastName", 0)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

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

    it("should not test mocks that come after finisher function.", function (done) {
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
        .withTestFinisherFunction("proxyInstance", "getFirstName", 1)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        // Don't need a shouldBeCalledWith because it never gets called
        // .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        // Don't need a shouldBeCalledWith because it never gets called
        // .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

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
  });

});
