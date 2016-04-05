"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  random = require("../random"),
  Controller = require("../testable/modules/test-module/from-synchronous-controller"),
  testConstants = require("../test-constants"),
  StatefulFactoryProxy = require("../testable/proxies/stateful-factory-proxy"),
  StatefulSingletonProxy = require("../testable/proxies/stateful-singleton-proxy"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy"),
  StatelessPreEs6SingletonProxy = require("../testable/proxies/stateless-pre-es6-singleton-proxy"),
  StatelessPreEs6StaticProxy = require("../testable/proxies/stateless-pre-es6-static-proxy");

const chai = require("chai"),
  uuid = require("node-uuid");

const Scenario = Maddox.functional.FromSynchronousScenario,
  expect = chai.expect;

describe("When using FromSynchronousScenario and getting errors", function () {
  let testContext;

  describe("without external dependencies", function () {

    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "noProxies";
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: testContext.params.personId,
          homeState: testContext.query.homeState
        };

        testContext.expectedStatusCode = [200];
      };
    });

    it("it should get expected result.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupExpected();

      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {};
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupExpected();

      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
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

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleName1Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.params.personId, testContext.getMiddleName1Result];
        testContext.getMiddleName2Result = random.firstName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleName2Result}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("uuid", "v4", uuid)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
        .doesReturn("uuid", "v4", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .perf(this.test.fullTitle())
        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {};
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("uuid", "v4", uuid)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("uuid", "v4", uuid)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
        .doesError("uuid", "v4", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleName1Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleName1Result = random.firstName();

        testContext.getMiddleName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleName2Result = new Error(testContext.expectedErrorMessage);
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("uuid", "v4", uuid)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
        .doesReturn("uuid", "v4", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulFactoryProxy", "factory", StatefulFactoryProxy)
        .mockThisFunction("uuid", "v4", uuid)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulFactoryProxy", "factory", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulFactoryProxy", "factory", testContext.proxyInstance)

        .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
        .doesError("uuid", "v4", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });
  });

  describe.skip("and using a stateful singleton proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statefulSingletonProxy";
        testContext.proxyInstance = StatefulSingletonProxy.getInstance();
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = random.lastName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleNameResult}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .perf(this.test.fullTitle())
        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a promise.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("StatefulSingletonProxy", "getInstance", StatefulSingletonProxy)
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("StatefulSingletonProxy", "getInstance", Maddox.constants.EmptyParameters)
        .doesReturn("StatefulSingletonProxy", "getInstance", testContext.proxyInstance)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });
  });

  describe.skip("and using a stateless es6 proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessEs6Proxy";
        testContext.proxyInstance = StatelessEs6Proxy;
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = random.lastName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleNameResult}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf(this.test.fullTitle())
        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a promise.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesErrorWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });
  });

  describe.skip("and using a stateless pre es6 singleton proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessPreEs6SingletonProxy";
        testContext.proxyInstance = StatelessPreEs6SingletonProxy;
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = random.lastName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleNameResult}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf(this.test.fullTitle())
        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a promise.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesErrorWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });
  });

  describe.skip("and using a stateless pre es6 static proxy", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessPreEs6StaticProxy";
        testContext.proxyInstance = StatelessPreEs6StaticProxy;
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = random.lastName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleNameResult}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .perf(this.test.fullTitle())
        .test(function (err, response) {
          try {
            expect(err).eql(undefined);
            expect(response).eql(testContext.expectedResponse);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle a checked exception.", function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;

        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle first call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle second call to mock throwing an error.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a promise.", function (done) {
      testContext.setupGetFirstName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = new Error(testContext.expectedErrorMessage);

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesErrorWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error with a callback.", function (done) {
      testContext.setupGetLastName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesErrorWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should handle mock throwing an error synchronously.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.expectedResponse = testContext.expectedErrorMessage;
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesError("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (err, response) {
          try {
            expect(err.message).eql(testContext.expectedResponse);
            expect(response).eql(undefined);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });
  });

  describe.skip("and using the debug flag", function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = "statelessEs6Proxy";
        testContext.proxyInstance = StatelessEs6Proxy;
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: "123456789"
        };
        testContext.query = {
          homeState: "IL"
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstNameParams = [Maddox.constants.EmptyParameters];
        testContext.getFirstNameResult = random.firstName();

        testContext.getFirstName2Params = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getFirstNameResult = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getLastNameResult = random.lastName();
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = {
          personId: `${testContext.params.personId}_${testContext.getMiddleNameResult}`,
          homeState: testContext.query.homeState
        };
      };
    });

    it("it should pass all tests.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.correctGetMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult];
        testContext.wrongGetMiddleNameParams = [testContext.params.personId, random.uniqueId()];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.wrongGetMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .shouldBeCalledWith("proxyInstance", "getLastName", testContext.getLastNameParams)
        .doesReturnWithCallback("proxyInstance", "getLastName", testContext.getLastNameResult)

        .debug()
        .test(function (err, response) {
          try {
            expect(response).eql(undefined);
            expect(err.stack.split(`"actual": "${testContext.correctGetMiddleNameParams[1]}"`).length).eql(2);
            expect(err.stack.split(`"expected": "${testContext.wrongGetMiddleNameParams[1]}"`).length).eql(2);
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it("it should NOT add the full object print out of actual and expected when the debug flag is NOT set.", function (done) {
      testContext.setupGetMiddleName = function () {
        testContext.expectedErrorMessage = `Proxy Error (${random.uniqueId()}): Some Proxy Error.`;

        testContext.getMiddleNameParams = [testContext.params.personId, testContext.getFirstNameResult, testContext.getMiddleNameResult];
        testContext.getMiddleNameResult = new Error(testContext.expectedErrorMessage);
      };
      testContext.setupExpected = function () {
        testContext.intentionalWrongResponse = ["SOME WRONG RESPONSE"];
        testContext.expectedResponse = [testContext.expectedErrorMessage];
        testContext.expectedStatusCode = [404];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario()
        .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
        .mockThisFunction("proxyInstance", "getLastName", testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstNameParams)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getFirstName", testContext.getFirstName2Params)
        .doesReturnWithPromise("proxyInstance", "getFirstName", testContext.getFirstNameResult)

        .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleNameParams)
        .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleNameResult)

        .test(function (response) {
          try {
            expect(response.stack.split(`"actual": "${testContext.expectedResponse}"`).length).eql(1);
            expect(response.stack.split(`"expected": "${testContext.intentionalWrongResponse}"`).length).eql(1);
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });
});
