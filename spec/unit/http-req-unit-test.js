"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/from-http-req-controller"),
  testConstants = require("../test-constants"),
  StatefulSingletonProxy = require("../testable/proxies/stateful-singleton-proxy");

const chai = require("chai");

const Scenario = Maddox.functional.HttpReqScenario;

describe("When using the HttpReqScenario", function () {
  let testContext;

  beforeEach(function () {
    testContext = {};

    testContext.setupTest = function () {
      testContext.entryPointObject = Controller;
      testContext.entryPointFunction = "statefulSingletonProxy";
      testContext.proxyInstance = StatefulSingletonProxy.getInstance();
    };

    testContext.setupHttpRequest = function () {
      testContext.httpRequest = {
        params: {
          personId: "123456789"
        },
        query: {
          homeState: "IL"
        }
      };

      testContext.httpRequestParams = [testContext.httpRequest];
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
      testContext.getLastNameResult = random.lastName();
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = [{
        personId: testContext.httpRequest.params.personId,
        homeState: testContext.httpRequest.query.homeState,
        lastName: testContext.getLastNameResult
      }];

      testContext.expectedStatusCode = [200];
    };
  });

  it("it should handle a successful request.", function (done) {
    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();

    new Scenario()
      .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
      .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

      .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

      .perf(this.test.fullTitle())
      .test(done);
  });

  it("it should handle a checked exception.", function (done) {
    testContext.setupHttpRequest = function () {
      testContext.httpRequest = {
        params: {},
        query: {
          homeState: "IL"
        }
      };

      testContext.httpRequestParams = [testContext.httpRequest];
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = [testConstants.MissingPersonIdParam];

      testContext.expectedStatusCode = [404];
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();

    new Scenario()
      .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .test(done);
  });

});
