"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  HttpReqController = require("../testable/modules/test-module/from-http-req-controller"),
  FromCallbackController = require("../testable/modules/test-module/from-callback-controller"),
  FromPromiseController = require("../testable/modules/test-module/from-promise-controller"),
  FromSynchronousController = require("../testable/modules/test-module/from-synchronous-controller"),
  SpecialScenariosController = require("../testable/modules/test-module/special-scenarios-controller"),
  constants = require("../../lib/constants"),
  Mocha = require("../../lib/proxies/mocha-proxy"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy"),
  ErrorFactory = require("../../lib/plugins/error-factory"),
  random = require("../random");

const chai = require("chai");

const expect = chai.expect,
  Scenario = Maddox.functional.HttpReqScenario,
  FromPromiseScenario = Maddox.functional.FromPromiseScenario,
  FromCallbackScenario = Maddox.functional.FromCallbackScenario,
  FromSynchronousScenario = Maddox.functional.FromSynchronousScenario;

describe("When using a Scenario and getting errors", function () {
  let testContext;

  beforeEach(function () {
    testContext = {};

    testContext.setupTest = function () {
      testContext.entryPointObject = HttpReqController;
      testContext.entryPointFunction = "statelessEs6Proxy";
    };

    testContext.setupHttpRequest = function () {
      testContext.httpRequest = {
        params: {
          personId: random.uniqueId()
        },
        query: {
          homeState: random.word(2)
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

  afterEach(function () {
    if (Mocha.shouldEqual.isSinonProxy) {
      Mocha.shouldEqual.restore();
    }
  });

  // 4003, 4004

  // InputParamsArray 1000
  it("it should throw when withInputParams is given a parameter that is not of type Array.", function () {
    testContext.setupInputParams = function () {
      testContext.inputParams = "Some type that is not of type Array.";
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.InputParamsArray);
    };

    testContext.setupInputParams();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .withInputParams(testContext.inputParamsArray);

    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }

  });

  // HttpRequestArray 1001
  it("it should throw when withHttpRequest is given a parameter that is not of type Array.", function () {
    testContext.setupInputParams = function () {
      testContext.inputParams = "Some type that is not of type Array.";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.HttpRequestArray);
    };

    testContext.setupInputParams();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .withHttpRequest(testContext.httpRequestParams);

    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }

  });

  // MockThisFunctionMockString 1002
  it("it should throw when the first parameter in mockThisFunction is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockThisFunctionMockString);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction({}, "shouldEqual", Mocha);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MockThisFunctionString 1003
  it("it should throw when the second parameter in mockThisFunction is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockThisFunctionString);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", function () {}, Mocha);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MockThisFunctionObject 1004
  it("it should throw when the third parameter in mockThisFunction is not an object.", function () {
    testContext.setupTest = function () {
      testContext.stringInput = "Some type that is not of type Array.";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockThisFunctionObject);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", testContext.stringInput);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // EntryPointObject 1005
  it("it should throw when the first parameter in withEntryPoint is not an object.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = "NotAnObject";
      testContext.entryPointFunction = "noProxies";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.EntryPointObject);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // EntryPointString 1006
  it("it should throw when the second parameter in withEntryPoint is not of type String.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = HttpReqController;
      testContext.entryPointFunction = function () {};
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.EntryPointString);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // EntryPointFunction 1007
  it("it should throw when 'withEntryPoint' is given a function to execute doesn't exist in the given object.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = HttpReqController;
      testContext.entryPointFunction = "someFunctionNotInObject";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.EntryPointFunction);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // ShouldBeCalledWithKeyString 1008
  it("it should throw when the first parameter in shouldBeCalledWith is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithKeyString);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .shouldBeCalledWith({}, "shouldEqual", []);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // ShouldBeCalledWithFunctionString 1009
  it("it should throw when the second parameter in shouldBeCalledWith is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithFunctionString);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .shouldBeCalledWith("Mocha", function () {}, []);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // ShouldBeCalledWithParamsArray 1010
  it("it should throw when the third parameter in shouldBeCalledWith is not of type Array.", function () {
    testContext.setupTest = function () {
      testContext.shouldBeCalledWithInput = "Some type that is not of type Array.";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ShouldBeCalledWithParamsArray);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .shouldBeCalledWith("Mocha", "shouldEqual", testContext.shouldBeCalledWithInput);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnMockName 1011
  it("it should throw when the first parameter in doesReturn is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturn({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnFuncName 1012
  it("it should throw when the second parameter in doesReturn is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturn("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnPromiseMockName 1013
  it("it should throw when the first parameter in doesReturnWithPromise is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnPromiseMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithPromise({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnPromiseFuncName 1014
  it("it should throw when the second parameter in doesReturnWithPromise is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnPromiseFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithPromise("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnCallbackMockName 1015
  it("it should throw when the first parameter in doesReturnWithCallback is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnCallbackMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithCallback({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesReturnCallbackFuncName 1016
  it("it should throw when the second parameter in doesReturnWithCallback is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesReturnCallbackFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithCallback("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorMockName 1017
  it("it should throw when the first parameter in doesError is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesError({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorFuncName 1018
  it("it should throw when the second parameter in doesError is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesError("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorPromiseMockName 1019
  it("it should throw when the first parameter in doesErrorWithPromise is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorPromiseMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithPromise({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorPromiseFuncName 1020
  it("it should throw when the second parameter in doesErrorWithPromise is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorPromiseFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithPromise("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorCallbackMockName 1021
  it("it should throw when the first parameter in doesErrorWithCallback is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorCallbackMockName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithCallback({}, "shouldEqual", {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // DoesErrorCallbackFuncName 1022
  it("it should throw when the second parameter in doesErrorWithCallback is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorCallbackFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithCallback("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingTestCallback 1023
  it("it should throw when HTTPReqScenario test is not given a function to execute upon completing the test.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1023): Every test must pass in a callback to execute when the test is complete.";
    };

    testContext.setupErrorMessage();

    try {
      new Scenario().test();

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingTestCallback 1023
  it("it should throw when FromCallbackScenario test is not given a function to execute upon completing the test.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromCallbackController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1023): Every test must pass in a callback to execute when the test is complete.";
    };

    testContext.setupErrorMessage();

    try {
      new FromCallbackScenario().test();

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingTestCallback 1023
  it("it should throw when FromPromiseScenario test is not given a function to execute upon completing the test.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromPromiseController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1023): Every test must pass in a callback to execute when the test is complete.";
    };

    testContext.setupErrorMessage();

    try {
      new FromPromiseScenario().test();

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingTestCallback 1023
  it("it should throw when FromSynchronousScenario test is not given a function to execute upon completing the test.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromSynchronousController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1023): Every test must pass in a callback to execute when the test is complete.";
    };

    testContext.setupErrorMessage();

    try {
      new FromSynchronousScenario().test();

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingEntryPoint 1024
  it("it should throw when the second parameter in doesErrorWithCallback is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.DoesErrorCallbackFuncName);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithCallback("Mocha", function () {}, {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingEntryPoint 1024
  it("it should throw when HTTPReqScenario test is not given a valid entry point.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1024): You must define a valid entry point before executing the test.";
    };

    testContext.setupErrorMessage();

    try {
      new Scenario().test(function () {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingEntryPoint 1024
  it("it should throw when FromCallbackScenario test is not given a valid entry point.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromCallbackController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1024): You must define a valid entry point before executing the test.";
    };

    testContext.setupErrorMessage();

    try {
      new FromCallbackScenario().test(function () {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingEntryPoint 1024
  it("it should throw when FromPromiseScenario test is not given a valid entry point.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromPromiseController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1024): You must define a valid entry point before executing the test.";
    };

    testContext.setupErrorMessage();

    try {
      new FromPromiseScenario().test(function () {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingEntryPoint 1024
  it("it should throw when FromSynchronousScenario test is not given a valid entry point.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = FromSynchronousController;
      testContext.entryPointFunction = "statelessEs6Proxy";
      testContext.proxyInstance = StatelessEs6Proxy;
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (1024): You must define a valid entry point before executing the test.";
    };

    testContext.setupErrorMessage();

    try {
      new FromSynchronousScenario().test(function () {});

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when shouldBeCalledWith is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .shouldBeCalledWith(testContext.mockName, testContext.funcName, Maddox.constants.EmptyParameters);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when shouldBeCalledWith is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .shouldBeCalledWith(testContext.mockName, testContext.funcName, Maddox.constants.EmptyParameters);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturn is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturn(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturn is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesReturn(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturnWithPromise is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithPromise(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturnWithPromise is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesReturnWithPromise(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturnWithCallback is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesReturnWithCallback(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesReturnWithCallback is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesReturnWithCallback(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesError is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesError(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesError is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesError(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesErrorWithPromise is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithPromise(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesErrorWithPromise is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesErrorWithPromise(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when doesErrorWithCallback is given a mock that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .doesErrorWithCallback(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockThisFunction 2000
  it("it should throw when 'doesErrorWithCallback' is given a mocked function that has yet to be initialized.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "someNotMockedFunction";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockThisFunction, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .doesErrorWithCallback(testContext.mockName, testContext.funcName, Maddox.constants.EmptyResult);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // FunctionNotInMock 2001
  it("it should throw when 'mockThisFunction' is given a function to mock doesn't exist in the given object.", function () {

    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = random.word();
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.FunctionNotInMock, [testContext.funcName, testContext.mockName]);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction(testContext.mockName, testContext.funcName, Mocha);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MockAlreadyExists 2002
  it("it should throw when the same function is mocked more than once.", function () {
    testContext.setupErrorMessage = function () {
      testContext.mockName = "Mocha";
      testContext.funcName = "shouldEqual";
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockAlreadyExists, [testContext.mockName, testContext.funcName]);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction(testContext.mockName, testContext.funcName, Mocha)
        .mockThisFunction(testContext.mockName, testContext.funcName, Mocha);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingCallback 3000
  it("it should throw when last parameter is not callback, when using '*WithCallback' and actually expecting a promise.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingCallback, ["StatelessEs6Proxy", "getFirstName"]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithCallback("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MissingCallback 3000
  it("it should throw when last parameter is not callback, when using '*WithCallback' and actually expecting a synchronous call.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingCallback, ["StatelessEs6Proxy", "getMiddleName"]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MissingMockedData 3001
  it("it should throw when first call to mock was not defined in test.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockedData, ["first", "StatelessEs6Proxy", "getFirstName"]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MissingMockedData 3001
  it("it should throw when second call to mock was not defined in test.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockedData, ["second", "StatelessEs6Proxy", "getFirstName"]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MockCalledWrongNumberOfTimes 3002
  it("it should throw when a mock is never called but the test expected it to be called.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, ["StatelessEs6Proxy", "dummyFunction", 1, 0]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "dummyFunction", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "dummyFunction", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "dummyFunction", testContext.getFirstName1Result)

      .test(function (err) {
        try {

          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // MockCalledWrongNumberOfTimes 3002
  it("it should throw when mock is called LESS times than expected in the test.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, ["StatelessEs6Proxy", "getFirstName", 3, 2]);
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // ComparisonShouldEqual 3003
  it("it should throw when expected value does not equal actual for first parameter in the first call to mock", function (done) {
    testContext.setupGetFirstName = function () {
      testContext.wrongParamValue = random.uniqueId();
      testContext.getFirstName1ParamsActual = [testContext.httpRequest.params.personId];
      testContext.getFirstName1ParamsExpected = [testContext.wrongParamValue];
      testContext.getFirstName1Result = random.firstName();

      testContext.getFirstName2Params = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
      testContext.getFirstName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["first", "StatelessEs6Proxy", "getFirstName", "first"]) +
        `: expected '${testContext.httpRequest.params.personId}' to deeply equal '${testContext.wrongParamValue}'`;
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1ParamsExpected)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // ComparisonShouldEqual 3003
  it("it should throw when expected value does not equal actual for first parameter in the second call to mock", function (done) {
    testContext.setupGetFirstName = function () {
      testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
      testContext.getFirstName1Result = random.firstName();

      testContext.wrongParamValue = random.uniqueId();
      testContext.getFirstName2ParamsActual = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
      testContext.getFirstName2ParamsExpected = [testContext.wrongParamValue, testContext.getFirstName1Result];

      testContext.getFirstName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["first", "StatelessEs6Proxy", "getFirstName", "second"]) +
        `: expected '${testContext.httpRequest.params.personId}' to deeply equal '${testContext.wrongParamValue}'`;
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2ParamsExpected)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // ComparisonShouldEqual 3003
  it("it should throw when expected value does not equal actual for second parameter in the second call to mock", function (done) {
    testContext.setupGetFirstName = function () {
      testContext.getFirstName1Params = [testContext.httpRequest.params.personId];
      testContext.getFirstName1Result = random.firstName();

      testContext.wrongParamValue = random.uniqueId();
      testContext.getFirstName2ParamsActual = [testContext.httpRequest.params.personId, testContext.getFirstName1Result];
      testContext.getFirstName2ParamsExpected = [testContext.httpRequest.params.personId, testContext.wrongParamValue];

      testContext.getFirstName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["second", "StatelessEs6Proxy", "getFirstName", "second"]) +
        `: expected '${testContext.getFirstName1Result}' to deeply equal '${testContext.wrongParamValue}'`;
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2ParamsExpected)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // ComparisonShouldEqual 3003
  it("it should throw when expected Response Mock value does not equal actual Response Mock value.", function (done) {
    testContext.setupExpected = function () {
      testContext.wrongParamValue = "SOME WRONG VALUE";

      testContext.actualResponse = [{
        personId: testContext.httpRequest.params.personId,
        homeState: testContext.httpRequest.query.homeState,
        lastName: testContext.getLastNameResult
      }];

      testContext.expectedResponse = [{
        personId: testContext.httpRequest.params.personId,
        homeState: testContext.httpRequest.query.homeState,
        lastName: testContext.wrongParamValue
      }];

      testContext.expectedStatusCode = [200];
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["first", "__ResponseMock__", "send", "first"]) +
        ": expected { Object (personId, homeState, ...) } to deeply equal { Object (personId, homeState, ...) }";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName1Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Params)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstName2Result)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // WrongNumberOfParams 3004
  it("it should throw when actual response mock is empty but expected contains params.", function (done) {
    testContext.setupTest = function () {
      testContext.entryPointObject = SpecialScenariosController;
      testContext.entryPointFunction = "emptyActual";
    };

    testContext.setupGetFirstName = function () {
      testContext.getFirstNameParams = [];
      testContext.getFirstNameResult = random.firstName();
    };

    testContext.setupGetMiddleName = function () {
      testContext.getMiddleNameParams = [];
      testContext.getMiddleNameResult = random.firstName();
    };

    testContext.setupGetLastName = function () {
      testContext.getLastNameParams = [];
      testContext.getLastNameResult = random.lastName();
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = [{
        firstName: random.uniqueId()
      }];

      testContext.expectedStatusCode = [200];
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Runtime Error (3004): Expected the first call to __ResponseMock__.send to have 1 param(s), but it was actually called with 0 param(s).";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameParams)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // WrongNumberOfParams 3004
  it("it should throw when using a promise proxy function and the actual params are empty but expected contains params.", function (done) {
    testContext.setupTest = function () {
      testContext.entryPointObject = SpecialScenariosController;
      testContext.entryPointFunction = "emptyActual";
    };

    testContext.setupGetFirstName = function () {
      testContext.getFirstNameParams = [{
        firstName: random.uniqueId()
      }];
      testContext.getFirstNameResult = random.firstName();
    };

    testContext.setupGetMiddleName = function () {
      testContext.getMiddleNameParams = [];
      testContext.getMiddleNameResult = random.firstName();
    };

    testContext.setupGetLastName = function () {
      testContext.getLastNameParams = [];
      testContext.getLastNameResult = random.lastName();
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = [];

      testContext.expectedStatusCode = [200];
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Runtime Error (3004): Expected the first call to StatelessEs6Proxy.getFirstName to have 1 param(s), but it was actually called with 0 param(s).";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameParams)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // WrongNumberOfParams 3004
  it("it should throw when using a synchronous proxy function and the actual params are empty but expected contains params.", function (done) {
    testContext.setupTest = function () {
      testContext.entryPointObject = SpecialScenariosController;
      testContext.entryPointFunction = "emptyActual";
    };

    testContext.setupGetFirstName = function () {
      testContext.getFirstNameParams = [];
      testContext.getFirstNameResult = random.firstName();
    };

    testContext.setupGetMiddleName = function () {
      testContext.getMiddleNameParams = [{
        firstName: random.uniqueId()
      }];
      testContext.getMiddleNameResult = random.firstName();
    };

    testContext.setupGetLastName = function () {
      testContext.getLastNameParams = [];
      testContext.getLastNameResult = random.lastName();
    };

    testContext.setupExpected = function () {
      testContext.expectedResponse = [];

      testContext.expectedStatusCode = [200];
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Runtime Error (3004): Expected the first call to StatelessEs6Proxy.getMiddleName to have 1 param(s), but it was actually called with 0 param(s).";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
      .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withHttpRequest(testContext.httpRequestParams)

      .resShouldBeCalledWith("send", testContext.expectedResponse)
      .resShouldBeCalledWith("status", testContext.expectedStatusCode)
      .resDoesReturnSelf("status")

      .shouldBeCalledWith("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameParams)
      .doesReturnWithPromise("StatelessEs6Proxy", "getFirstName", testContext.getFirstNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameParams)
      .doesReturn("StatelessEs6Proxy", "getMiddleName", testContext.getMiddleNameResult)

      .shouldBeCalledWith("StatelessEs6Proxy", "getLastName", testContext.getLastNameParams)
      .doesReturnWithCallback("StatelessEs6Proxy", "getLastName", testContext.getLastNameResult)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // ResShouldBeCalledWithFunctionString 4000
  it("it should throw when the first parameter in 'resShouldBeCalledWith' is not of type String.", function () {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray);
    };

    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .resShouldBeCalledWith("Mocha", function () {}, []);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // ResShouldBeCalledWithParamsArray 4001
  it("it should throw when the second parameter in 'resShouldBeCalledWith' is not of type Array.", function () {
    testContext.setupTest = function () {
      testContext.shouldBeCalledWithInput = "Some type that is not of type Array.";
    };

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ResShouldBeCalledWithParamsArray);
    };

    testContext.setupTest();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("Mocha", "shouldEqual", Mocha)
        .resShouldBeCalledWith("Mocha", "shouldEqual", testContext.shouldBeCalledWithInput);

      expect("Should not reach this line of code.").eql(undefined);
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // ExactlyOneResponseFinisher 4002
  it("it should throw when a HTTP Response Finisher function is declared more than once.", function () {

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (4002): Exactly one HTTP Response Finisher can be used per scenario. When a HTTP Response Finisher function is called, the testable code phase will end, and the validation phase will begin. Please see below for a list of HTTP Response Finishers.";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .resShouldBeCalledWith("send", testContext.expectedResponse)
        .resShouldBeCalledWith("json", testContext.expectedResponse);
    } catch (err) {
      let possibleFinisherFunctions = "\"responseFinishers\": [\n" +
        "    \"send\",\n" +
        "    \"json\",\n" +
        "    \"jsonp\",\n" +
        "    \"redirect\",\n" +
        "    \"sendFile\",\n" +
        "    \"render\",\n" +
        "    \"sendStatus\",\n" +
        "    \"end\"\n" +
        "  ]";

      expect(err.message).eql(testContext.expectedErrorMessage);
      expect(err.stack.split(possibleFinisherFunctions).length).eql(2);
    }

  });

  // ExactlyOneResponseFinisher 4002
  it("it should throw when a HTTP Response Finisher function is NOT declared at all.", function () {

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (4002): Exactly one HTTP Response Finisher can be used per scenario. When a HTTP Response Finisher function is called, the testable code phase will end, and the validation phase will begin. Please see below for a list of HTTP Response Finishers.";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withHttpRequest(testContext.httpRequestParams)

        .test(function () {});
    } catch (err) {
      let possibleFinisherFunctions = "\"responseFinishers\": [\n" +
        "    \"send\",\n" +
        "    \"json\",\n" +
        "    \"jsonp\",\n" +
        "    \"redirect\",\n" +
        "    \"sendFile\",\n" +
        "    \"render\",\n" +
        "    \"sendStatus\",\n" +
        "    \"end\"\n" +
        "  ]";

      expect(err.message).eql(testContext.expectedErrorMessage);
      expect(err.stack.split(possibleFinisherFunctions).length).eql(2);
    }

  });

  // HttpReqUndefined 4003
  it("it should throw when the user has not set the HTTP Request object using the 'withHttpRequest' function.", function () {

    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = "Maddox Scenario Build Error (4003): You need to define the Http Request object using the 'withHttpRequest' function.";
    };

    testContext.setupTest();
    testContext.setupHttpRequest();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupGetLastName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    try {
      new Scenario()
        .mockThisFunction("StatelessEs6Proxy", "getFirstName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getMiddleName", StatelessEs6Proxy)
        .mockThisFunction("StatelessEs6Proxy", "getLastName", StatelessEs6Proxy)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)

        .test(function () {});
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }

  });

});
