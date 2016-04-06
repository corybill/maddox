"use strict";

const Maddox = require("../../lib/index"), // require("maddox");
  Controller = require("../testable/modules/test-module/from-synchronous-controller"),
  constants = require("../../lib/constants"),
  Mocha = require("../../lib/proxies/mocha-proxy"),
  StatelessEs6Proxy = require("../testable/proxies/stateless-es6-proxy"),
  ErrorFactory = require("../../lib/plugins/error-factory"),
  random = require("../random");

const chai = require("chai"),
  uuid = require("node-uuid");

const expect = chai.expect,
  Scenario = Maddox.functional.FromSynchronousScenario;

describe("When using the FromSynchronousScenario,", function () {
  let testContext;

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

  afterEach(function () {
    if (Mocha.shouldEqual.isSinonProxy) {
      Mocha.shouldEqual.restore();
    }
  });

  // HttpRequestArray 1001
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
        .withInputParams(testContext.inputParams);

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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // EntryPointString 1006
  it("it should throw when the second parameter in withEntryPoint is not of type String.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = Controller;
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // EntryPointFunction 1007
  it("it should throw when 'withEntryPoint' is given a function to execute doesn't exist in the given object.", function () {
    testContext.setupTest = function () {
      testContext.entryPointObject = Controller;
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
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

      expect("Should not reach this line of code.").to.be.undefined; // eslint-disable-line no-unused-expressions
    } catch (err) {
      expect(err.message).eql(testContext.expectedErrorMessage);
    }
  });

  // MissingMockedData 3001
  it("it should throw when first call to mock was not defined in test.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockedData, ["first", "uuid", "v4"]);
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

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
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MissingMockedData, ["second", "proxyInstance", "getMiddleName"]);
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

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
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, ["proxyInstance", "dummyFunction", 1, 0]);
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)
      .mockThisFunction("proxyInstance", "dummyFunction", testContext.proxyInstance)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

      .shouldBeCalledWith("proxyInstance", "dummyFunction", testContext.getMiddleName2Params)
      .doesReturnWithPromise("proxyInstance", "dummyFunction", testContext.getMiddleName2Result)

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
  it("should throw when mock is called LESS times than expected in the test.", function (done) {
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.MockCalledWrongNumberOfTimes, ["uuid", "v4", 2, 1]);
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // shouldEqual Error
  it("should throw when expected value does not equal actual for first parameter in the first call to mock", function (done) {
    testContext.setupGetMiddleName = function () {
      testContext.wrongParam = random.uniqueId();
      testContext.getMiddleName1Params = [testContext.wrongParam, testContext.getFirstNameResult];
      testContext.getMiddleName1Result = random.firstName();

      testContext.getMiddleName2Params = [testContext.params.personId, testContext.getMiddleName1Result];
      testContext.getMiddleName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["first", "proxyInstance", "getMiddleName", "first"]) +
        `: expected '${testContext.params.personId}' to deeply equal '${testContext.wrongParam}'`;
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // shouldEqual Error
  it("should throw when expected value does not equal actual for first parameter in the second call to mock", function (done) {
    testContext.setupGetMiddleName = function () {
      testContext.wrongParam = random.uniqueId();
      testContext.getMiddleName1Params = [testContext.params.personId, testContext.getFirstNameResult];
      testContext.getMiddleName1Result = random.firstName();

      testContext.getMiddleName2Params = [testContext.wrongParam, testContext.getMiddleName1Result];
      testContext.getMiddleName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["first", "proxyInstance", "getMiddleName", "second"]) +
        `: expected '${testContext.params.personId}' to deeply equal '${testContext.wrongParam}'`;
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  // shouldEqual Error
  it("should throw when expected value does not equal actual for second parameter in the second call to mock", function (done) {
    testContext.setupGetMiddleName = function () {
      testContext.wrongParam = random.uniqueId();
      testContext.getMiddleName1Params = [testContext.params.personId, testContext.getFirstNameResult];
      testContext.getMiddleName1Result = random.firstName();

      testContext.getMiddleName2Params = [testContext.params.personId, testContext.wrongParam];
      testContext.getMiddleName2Result = random.firstName();
    };
    testContext.setupErrorMessage = function () {
      testContext.expectedErrorMessage = ErrorFactory.build(constants.errorMessages.ComparisonShouldEqual, ["second", "proxyInstance", "getMiddleName", "second"]) +
        `: expected '${testContext.getMiddleName1Result}' to deeply equal '${testContext.wrongParam}'`;
    };

    testContext.setupTest();
    testContext.setupInputParams();
    testContext.setupGetFirstName();
    testContext.setupGetMiddleName();
    testContext.setupExpected();
    testContext.setupErrorMessage();

    new Scenario()
      .mockThisFunction("proxyInstance", "getFirstName", testContext.proxyInstance)
      .mockThisFunction("proxyInstance", "getMiddleName", testContext.proxyInstance)
      .mockThisFunction("uuid", "v4", uuid)

      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(testContext.inputParams)

      .shouldBeCalledWith("uuid", "v4", testContext.getFirstNameParams)
      .doesReturn("uuid", "v4", testContext.getFirstNameResult)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName1Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName1Result)

      .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
      .doesReturn("proxyInstance", "getMiddleName", testContext.getMiddleName2Result)

      .test(function (err) {
        try {
          expect(err.message).eql(testContext.expectedErrorMessage);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });
});
