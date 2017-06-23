"use strict";

exports.ordinalValues = {
  0: "first",
  1: "second",
  2: "third",
  3: "fourth",
  4: "fifth",
  5: "sixth",
  6: "seventh",
  7: "eighth",
  8: "ninth",
  9: "tenth",
  10: "eleventh",
  11: "twelfth",
  12: "thirteenth",
  13: "fourteenth",
  14: "fifteenth",
  15: "sixteenth",
  16: "seventeenth",
  17: "eighteenth",
  18: "ninteenth",
  19: "twentieth"
};

exports.defaults = {
  MaxPerfResults: 10,
  DefaultReportPath: "maddox/perf-report.json"
};

exports.ResponseMockName = "HttpResponseMock";
exports.ResponseEndFunctions = {
  send: true,
  json: true,
  jsonp: true,
  redirect: true,
  sendFile: true,
  render: true,
  sendStatus: true,
  end: true
};

// 1000's are errors during scenario building
// 2000's are errors during mock building
// 3000's are errors during test execution
// 4000's are errors specific to HttpReqScenario

const errorTypes = {
  MaddoxBuildError: {
    key: "MaddoxBuildError",
    prefix: "Maddox Scenario Build Error"
  },
  MaddoxRuntimeError: {
    key: "MaddoxRuntimeError",
    prefix: "Maddox Runtime Error"
  },
  MaddoxComparisonError: {
    key: "MaddoxComparisonError",
    prefix: "Maddox Comparison Error"
  },
  MaddoxUncheckedError: {
    key: "MaddoxUncheckedError",
    prefix: "Unchecked Error"
  }
};

exports.errorTypes = errorTypes;

exports.errorMessages = {
  InputParamsArray: {
    code: 1000,
    message: "When calling 'withInputParams', the parameter must be of type Array.",
    type: errorTypes.MaddoxBuildError
  },
  HttpRequestArray: {
    code: 1001,
    message: "When calling 'withHttpRequest', the parameter must be of type Array.",
    type: errorTypes.MaddoxBuildError
  },

  MockThisFunctionMockString: {
    code: 1002,
    message: "When calling 'mockThisFunction', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  MockThisFunctionString: {
    code: 1003,
    message: "When calling 'mockThisFunction', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },
  MockThisFunctionObject: {
    code: 1004,
    message: "When calling 'mockThisFunction', the third parameter must be of type Object containing the function that you'd like to mock.",
    type: errorTypes.MaddoxBuildError
  },

  EntryPointObject: {
    code: 1005,
    message: "When calling 'withEntryPoint', the first parameter must be of type object representing the object that contains the function to be mocked.",
    type: errorTypes.MaddoxBuildError
  },
  EntryPointString: {
    code: 1006,
    message: "When calling 'withEntryPoint', the second parameter must be of type String representing the function name that will be mocked.",
    type: errorTypes.MaddoxBuildError
  },
  EntryPointFunction: {
    code: 1007,
    message: "When calling 'withEntryPoint', the second param must be the name of a function in the first param object.",
    type: errorTypes.MaddoxBuildError
  },

  ShouldBeCalledWithKeyString: {
    code: 1008,
    message: "When calling 'shouldBeCalledWith', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  ShouldBeCalledWithFunctionString: {
    code: 1009,
    message: "When calling 'shouldBeCalledWith', the second parameter must be of type String representing the function that was mocked.",
    type: errorTypes.MaddoxBuildError
  },
  ShouldBeCalledWithParamsArray: {
    code: 1010,
    message: "When calling 'shouldBeCalledWith', the third parameter must be of type Array containing the expected parameters.",
    type: errorTypes.MaddoxBuildError
  },

  DoesReturnMockName: {
    code: 1011,
    message: "When calling 'doesReturn', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnFuncName: {
    code: 1012,
    message: "When calling 'doesReturn', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  DoesReturnPromiseMockName: {
    code: 1013,
    message: "When calling 'doesReturnWithPromise', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnPromiseFuncName: {
    code: 1014,
    message: "When calling 'doesReturnWithPromise', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  DoesReturnCallbackMockName: {
    code: 1015,
    message: "When calling 'doesReturnWithCallback', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnCallbackFuncName: {
    code: 1016,
    message: "When calling 'doesReturnWithCallback', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  DoesErrorMockName: {
    code: 1017,
    message: "When calling 'doesError', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorFuncName: {
    code: 1018,
    message: "When calling 'doesError', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  DoesErrorPromiseMockName: {
    code: 1019,
    message: "When calling 'doesErrorWithPromise', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorPromiseFuncName: {
    code: 1020,
    message: "When calling 'doesErrorWithPromise', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  DoesErrorCallbackMockName: {
    code: 1021,
    message: "When calling 'doesErrorWithCallback', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorCallbackFuncName: {
    code: 1022,
    message: "When calling 'doesErrorWithCallback', the second parameter must be of type String representing the function to mock.",
    type: errorTypes.MaddoxBuildError
  },

  MissingTestCallback: {
    code: 1023,
    message: "Every test must pass in a callback to execute when the test is complete.",
    type: errorTypes.MaddoxBuildError
  },
  MissingEntryPoint: {
    code: 1024,
    message: "You must define a valid entry point before executing the test.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnCallbackDataToReturn: {
    code: 1025,
    message: "When calling 'doesReturnWithCallback', the third parameter must be of type Array containing the callback's parameters.",
    type: errorTypes.MaddoxBuildError
  },
  DoesAlwaysReturnCallbackDataToReturn: {
    code: 1026,
    message: "When calling 'doesAlwaysReturnWithCallback', the third parameter must be of type Array containing the callback's parameters.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorCallbackDataToReturn: {
    code: 1027,
    message: "When calling 'doesErrorWithCallback', the third parameter must be of type Array containing the callback's parameters.",
    type: errorTypes.MaddoxBuildError
  },
  MissingMochaTestContext: {
    code: 1028,
    message: "When running a performance test, the 'this' context must be provided in the scenario constructor.",
    type: errorTypes.MaddoxBuildError
  },
  IllegalMochaThisContext: {
    code: 1028,
    message: "Illegal mocha context. If you use arrow functions for your 'it' block, the lexical scoping will bind the top level of your test file to this. Maddox is dependent on the values that Mocha places on the this context. These values will be overwritten when you use arrow functions.",
    type: errorTypes.MaddoxBuildError
  },
  MissingInputParams: {
    code: 1029,
    message: "Before executing a test, you must provide input parameters using the 'withInputParams' function.",
    type: errorTypes.MaddoxBuildError
  },

  MissingMockThisFunction: {
    code: 2000,
    message: "You must declare the mock %s.%s, using 'mockThisFunction' before declaring return values.",
    type: errorTypes.MaddoxBuildError
  },
  FunctionNotInMock: {
    code: 2001,
    message: "Function %s does not exist in mock %s.",
    type: errorTypes.MaddoxBuildError
  },
  MockAlreadyExists: {
    code: 2002,
    message: "Attempted to mock %s.%s, but it was already mocked.",
    type: errorTypes.MaddoxBuildError
  },

  MissingCallback: {
    code: 3000,
    message: "When using 'doesReturnWithCallback' or 'doesErrorWithCallback' for %s.%s the last parameter in the function must be the callback function.",
    type: errorTypes.MaddoxRuntimeError
  },
  MissingMockedData: {
    code: 3001,
    message: "Attempted to get mocked data for the %s call to %s.%s, but it wasn't created in the scenario.  You are missing a 'doesReturn / doesError' call.",
    type: errorTypes.MaddoxRuntimeError
  },
  MockCalledWrongNumberOfTimes: {
    code: 3002,
    message: "Expected the mock %s.%s to be called %s time(s), but it was actually called %s time(s).",
    type: errorTypes.MaddoxRuntimeError
  },
  ComparisonShouldEqual: {
    code: 3003,
    message: "Failed expectation for the %s param in mock %s.%s, the %s time the mock was called ::::",
    type: errorTypes.MaddoxComparisonError
  },
  WrongNumberOfParams: {
    code: 3004,
    message: "Expected the %s call to %s.%s to have %s param(s), but it was actually called with %s param(s).",
    type: errorTypes.MaddoxRuntimeError
  },

  ResShouldBeCalledWithFunctionString: {
    code: 4000,
    message: "When calling 'resShouldBeCalledWith', the first parameter must be of type String representing the function that was mocked.",
    type: errorTypes.MaddoxBuildError
  },
  ResShouldBeCalledWithParamsArray: {
    code: 4001,
    message: "When calling 'resShouldBeCalledWith', the second parameter must be of type Array containing the expected parameters.",
    type: errorTypes.MaddoxBuildError
  },
  ExactlyOneResponseFinisher: {
    code: 4002,
    message: "Exactly one HTTP Response Finisher can be used per scenario. When a HTTP Response Finisher function is called, the testable code phase will end, and the validation phase will begin. Please see below for a list of HTTP Response Finishers.",
    type: errorTypes.MaddoxBuildError
  },
  HttpReqUndefined: {
    code: 4003,
    message: "Before executing a test, you must provide input parameters using the 'withInputParams' or 'withHttpRequest' functions.",
    type: errorTypes.MaddoxBuildError
  },

  CatchOwnErrors: {
    code: 4004,
    message: "To prevent false positives, please handle expectation failures yourself. Wrap your expectations in a try / catch or handle in a catch block from the promise that is returned from the 'test' function. Please see below for test failure.",
    type: errorTypes.MaddoxUncheckedError
  }
};
