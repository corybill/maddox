"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/from-http-req-controller"),
  SpecialScenariosController = require("../testable/modules/test-module/special-scenarios-controller"),
  testConstants = require("../test-constants"),
  StatefulFactoryProxy = require("../testable/proxies/stateful-factory-proxy"),
  StatefulSingletonProxy = require("../testable/proxies/stateful-singleton-proxy"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy"),
  StatelessPreEs6SingletonProxy = require("../testable/proxies/stateless-pre-es6-singleton-proxy"),
  StatelessPreEs6StaticProxy = require("../testable/proxies/stateless-pre-es6-static-proxy");

const Scenario = Maddox.functional.HttpReqScenario;

describe("When using a Scenario", function () {
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

      new Scenario(this)
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .test(done);
    });
  });

  describe("and using a stateful factory proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statefulFactoryProxy";
        testContext.proxyInstance = StatefulFactoryProxy.factory();
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName: testContext.getLastNameResult[1]
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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf()
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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = [new Error(testContext.expectedErrorMessage)];
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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

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

      new Scenario(this)
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });

  describe("and using a stateful singleton proxy", function () {
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName: testContext.getLastNameResult[1]
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

      new Scenario(this)
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

        .perf()
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

      new Scenario(this)
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

      new Scenario(this)
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

      new Scenario(this)
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

      new Scenario(this)
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
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = [new Error(testContext.expectedErrorMessage)];
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

      new Scenario(this)
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

      new Scenario(this)
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
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });

  describe("and using a stateless es6 proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessEs6Proxy";
        testContext.proxyInstance = StatelessEs6Proxy;
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName: testContext.getLastNameResult[1]
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf()
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

      new Scenario(this)
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = [new Error(testContext.expectedErrorMessage)];
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });

  describe("and using a stateless pre es6 singleton proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessPreEs6SingletonProxy";
        testContext.proxyInstance = StatelessPreEs6SingletonProxy;
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName: testContext.getLastNameResult[1]
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf()
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

      new Scenario(this)
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = [new Error(testContext.expectedErrorMessage)];
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });

  describe("and using a stateless pre es6 static proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessPreEs6StaticProxy";
        testContext.proxyInstance = StatelessPreEs6StaticProxy;
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName: testContext.getLastNameResult[1]
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf()
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

      new Scenario(this)
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .test(done);
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getLastNameResult = [new Error(testContext.expectedErrorMessage)];
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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

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

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(done);
    });
  });

  describe("and using the noDebug flag", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessEs6Proxy";
        testContext.proxyInstance = StatelessEs6Proxy;
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
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.intentionalWrongResponse = ["SOME WRONG RESPONSE"];
        testContext.expectedStatusCode = [404];

        let debugParams = {
          actual: testContext.expectedErrorMessage,
          expected: testContext.intentionalWrongResponse[0]
        };

        testContext.expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);
      };
    });

    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.intentionalWrongResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (response) {
          try {
            Maddox.compare.shouldEqual({actual: response.stack.split(testContext.expectedResponse).length, expected: 2});
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.intentionalWrongResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .noDebug()
        .test(function (response) {
          try {
            Maddox.compare.shouldEqual({actual: response.stack.split(testContext.expectedResponse).length, expected: 1});
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  describe("and using shouldAlways / doesAlways", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = SpecialScenariosController;
        testContext.entryPointFunction = "shouldAlwaysDoesAlways";
        testContext.proxyInstance = StatelessEs6Proxy;
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
        testContext.getFirstNameParams = [testContext.httpRequest.params.personId, testContext.httpRequest.query.homeState];
        testContext.getFirstName1Result = random.firstName();
        testContext.getFirstName2Result = random.firstName();
        testContext.getFirstName3Result = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName2Result];
        testContext.getMiddleName2Result = random.firstName();

        testContext.getMiddleName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName3Result];
        testContext.getMiddleName3Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];

        testContext.getLastName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName2Result, testContext.getMiddleName2Result];
        testContext.getLastName2Result = [undefined, random.lastName()];

        testContext.getLastName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName3Result, testContext.getMiddleName3Result];
        testContext.getLastName3Result = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName1: testContext.getLastName1Result[1],
          lastName2: testContext.getLastName2Result[1],
          lastName3: testContext.getLastName3Result[1]
        }];

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should process when using shouldAlways for some proxy calls, but not using doesAlways for any proxy calls.", function (done) {
      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName3Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName3Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName3Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName1Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName2Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName2Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName3Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName3Result)

        .test(done);
    });

    it("it should process when using shouldAlways for some proxy calls, and using doesAlways for some proxy calls.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName2Result = random.firstName();

        testContext.getMiddleName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName3Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];

        testContext.getLastName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName2Result];
        testContext.getLastName2Result = [undefined, random.lastName()];

        testContext.getLastName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName3Result];
        testContext.getLastName3Result = [undefined, random.lastName()];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesAlwaysReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName3Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName3Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName1Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName2Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName2Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName3Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName3Result)

        .test(done);
    });

    it("it should process when using shouldAlways for some proxy calls, and using doesAlways for all proxy calls.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName2Result = random.firstName();

        testContext.getMiddleName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName3Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];

        testContext.getLastName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName2Result = [undefined, random.lastName()];

        testContext.getLastName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName3Result = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName1: testContext.getLastName1Result[1],
          lastName2: testContext.getLastName1Result[1],
          lastName3: testContext.getLastName1Result[1]
        }];

        testContext.expectedStatusCode = [200];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesAlwaysReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName3Params)
        .doesAlwaysReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName1Params)
        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName2Params)
        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName3Params)
        .doesAlwaysReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .test(done);
    });

    it("it should process when using shouldAlways for all proxy calls, and using doesAlways for all proxy calls.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName1: testContext.getLastName1Result[1],
          lastName2: testContext.getLastName1Result[1],
          lastName3: testContext.getLastName1Result[1]
        }];

        testContext.expectedStatusCode = [200];
      };

      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesAlwaysReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)

        .shouldAlwaysBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .doesAlwaysReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldAlwaysBeCalledWith("proxyInstance", "getLastName", testContext.getLastName1Params)
        .doesAlwaysReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .test(done);
    });
  });

  describe("and changing the state of a shouldBeCalledWith through out the code", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = SpecialScenariosController;
        testContext.entryPointFunction = "modifyingContext";
        testContext.proxyInstance = StatelessEs6Proxy;
      };

      testContext.setupHttpRequest = function () {
        testContext.httpRequest = {};
        testContext.httpRequestParams = [testContext.httpRequest];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstName1Params = [{
          someValue1: "first"
        }];
        testContext.getFirstName2Params = [{
          someValue1: "first",
          someValue2: "second"
        }];
        testContext.getFirstName3Params = [{
          someValue1: "first",
          someValue2: "second",
          someValue3: "third"
        }];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          someValue1: "first",
          someValue2: "second",
          someValue3: "third"
        }];

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should test the mock inputParams with the state that they were called with.", function (done) {
      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName1Params)
        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName3Params)
        .doesAlwaysReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(done);
    });
  });

  describe("and using shouldAlwaysIgnore", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = SpecialScenariosController;
        testContext.entryPointFunction = "shouldAlwaysDoesAlways";
        testContext.proxyInstance = StatelessEs6Proxy;
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
        testContext.getFirstNameParams = ["WrongAnswer", testContext.httpRequest.query.homeState];
        testContext.getFirstName1Result = random.firstName();
        testContext.getFirstName2Result = random.firstName();
        testContext.getFirstName3Result = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName2Result];
        testContext.getMiddleName2Result = random.firstName();

        testContext.getMiddleName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName3Result];
        testContext.getMiddleName3Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = ["WrongAnswer", testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];

        testContext.getLastName2Params = ["WrongAnswer", testContext.getFirstName2Result, testContext.getMiddleName2Result];
        testContext.getLastName2Result = [undefined, random.lastName()];

        testContext.getLastName3Params = ["WrongAnswer", testContext.getFirstName3Result, testContext.getMiddleName3Result];
        testContext.getLastName3Result = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName1: testContext.getLastName1Result[1],
          lastName2: testContext.getLastName2Result[1],
          lastName3: testContext.getLastName3Result[1]
        }];

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should process when using shouldAlwaysIgnore", function (done) {
      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeIgnored("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName3Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName3Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getLastName")
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName2Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName2Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName3Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName3Result)

        .test(done);
    });
  });

  describe("and no passing in the test context", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = SpecialScenariosController;
        testContext.entryPointFunction = "shouldAlwaysDoesAlways";
        testContext.proxyInstance = StatelessEs6Proxy;
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
        testContext.getFirstNameParams = ["WrongAnswer", testContext.httpRequest.query.homeState];
        testContext.getFirstName1Result = random.firstName();
        testContext.getFirstName2Result = random.firstName();
        testContext.getFirstName3Result = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName2Result];
        testContext.getMiddleName2Result = random.firstName();

        testContext.getMiddleName3Params = [testContext.httpRequest.params.personId, testContext.getFirstName3Result];
        testContext.getMiddleName3Result = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastName1Params = ["WrongAnswer", testContext.getFirstName1Result, testContext.getMiddleName1Result];
        testContext.getLastName1Result = [undefined, random.lastName()];

        testContext.getLastName2Params = ["WrongAnswer", testContext.getFirstName2Result, testContext.getMiddleName2Result];
        testContext.getLastName2Result = [undefined, random.lastName()];

        testContext.getLastName3Params = ["WrongAnswer", testContext.getFirstName3Result, testContext.getMiddleName3Result];
        testContext.getLastName3Result = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = [{
          personId: testContext.httpRequest.params.personId,
          homeState: testContext.httpRequest.query.homeState,
          lastName1: testContext.getLastName1Result[1],
          lastName2: testContext.getLastName2Result[1],
          lastName3: testContext.getLastName3Result[1]
        }];

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should process when not providing test context and not marking as performance test.", function (done) {
      testContext.setupTest();
      testContext.setupHttpRequest();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("status", testContext.expectedStatusCode)
        .resDoesReturnSelf("status")

        .shouldAlwaysBeIgnored("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName1Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName2Result)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstName3Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getMiddleName")
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName3Result)

        .shouldAlwaysBeIgnored("proxyInstance", "getLastName")
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName1Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName2Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName2Result)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastName3Params)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastName3Result)

        .test(done);
    });
  });
});
