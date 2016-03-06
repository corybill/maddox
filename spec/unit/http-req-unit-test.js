"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/test-module-controller"),
  testConstants = require("../test-constants"),
  constants = require("../../lib/constants"),
  ProxyClass = require("../testable/proxies/stateful-factory-proxy"),
  StatefulSingletonProxy = require("../testable/proxies/stateful-singleton-proxy"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy"),
  StatelessPreEs6SingletonProxy = require("../testable/proxies/stateless-pre-es6-singleton-proxy"),
  StatelessPreEs6StaticProxy = require("../testable/proxies/stateless-pre-es6-static-proxy");

const chai = require("chai");

const expect = chai.expect,
  Scenario = Maddox.functional.HttpReqScenario;

describe("When Unit Testing an Express Http Request", function () {
  let testContext;

  describe("without external dependencies", function () {

    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "noProxies";
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

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState
        }];

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should get expected result.", function (done) {

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupExpected();

      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

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
      testContext.setupExpected();

      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .test(done);
    });

  });

  describe("and using a stateful factory proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statefulFactoryProxy";
        testContext.proxyInstance = ProxyClass.factory();
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

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

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
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .test(done);
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
        testContext.getFirstName1Result = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getFirstName2Result = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
        testContext.getFirstName1Result = random.firstName();

        testContext.getFirstName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getFirstName2Result = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a promise.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
        testContext.getFirstName1Result = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getFirstName2Result = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesErrorWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .test(done);
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("ProxyClass", "factory", ProxyClass)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resShouldBeChainable("status")

        .shouldBeCalledWith("ProxyClass", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("ProxyClass", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });
});
