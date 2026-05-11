// lib/scenarios/http-req-scenario.js
import Preconditions3 from "preconditions";

// lib/scenarios/scenario.js
import Preconditions2 from "preconditions";

// lib/proxies/mocha-proxy.js
import varDiff from "variable-diff";
import chai from "chai";
import Errr from "errr";
import util from "util";
import isSubset from "is-subset";
import CoreUtilIs from "core-util-is";

// lib/constants.js
var ordinalValues = {
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
var defaults = {
  MaxPerfResults: 10,
  DefaultReportPath: "maddox/perf-report.json"
};
var IgnoreParam = "1915ba58-d374-46a1-8b0f-a17803584278";
var ResponseMockName = "HttpResponseMock";
var ResponseEndFunctions = {
  send: true,
  json: true,
  jsonp: true,
  redirect: true,
  sendFile: true,
  render: true,
  sendStatus: true,
  end: true
};
var scenarioTypes = {
  FromCallbackScenario: "FromCallbackScenario",
  FromPromiseScenario: "FromPromiseScenario",
  FromSynchronousScenario: "FromSynchronousScenario",
  HttpReqScenario: "HttpReqScenario",
  FrameworkRouteScenario: "FrameworkRouteScenario"
};
var errorTypes = {
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
var errorMessages = {
  InputParamsArray: {
    code: 1e3,
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
    message: "When calling 'withEntryPoint', the first parameter must be of type object representing the object that contains the EntryPointString (i.e. function) that will be called to kick off the test.",
    type: errorTypes.MaddoxBuildError
  },
  EntryPointString: {
    code: 1006,
    message: "When calling 'withEntryPoint', the second parameter must be of type string representing the function that will be called to kick off the test.",
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
    message: "Illegal mocha context. If you use arrow functions for your 'it' block, the lexical scoping will bind the top level of your test file to the 'this' context. Maddox is dependent on the values that Mocha places on the 'this' context. These values will be overwritten when you use arrow functions. To fix this issue, use function declarations on your it blocks and do NOT use arrow functions.",
    type: errorTypes.MaddoxBuildError
  },
  MissingInputParams: {
    code: 1029,
    message: "Before executing a test, you must provide input parameters using the 'withInputParams' function.",
    type: errorTypes.MaddoxBuildError
  },
  HeaderNameShouldBeString: {
    code: 1030,
    message: "When using 'resShouldContainHeader', the first parameter must be of type string that is equal to the header name.",
    type: errorTypes.MaddoxBuildError
  },
  HeaderValueShouldBeString: {
    code: 1031,
    message: "When using 'resShouldContainHeader', the second parameter must be of type string that is equal to the header value.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnDataToReturn: {
    code: 1032,
    message: "When calling 'doesReturn', the third parameter must a defined value or Maddox.constants.EmptyResult.",
    type: errorTypes.MaddoxBuildError
  },
  DoesReturnPromiseDataToReturn: {
    code: 1033,
    message: "When calling 'doesReturnWithPromise', the third parameter must a defined value or Maddox.constants.EmptyResult.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorDataToReturn: {
    code: 1034,
    message: "When calling 'doesError', the third parameter must a defined value or Maddox.constants.EmptyResult.",
    type: errorTypes.MaddoxBuildError
  },
  DoesErrorPromiseDataToReturn: {
    code: 1035,
    message: "When calling 'doesErrorWithPromise', the third parameter must a defined value or Maddox.constants.EmptyResult.",
    type: errorTypes.MaddoxBuildError
  },
  ShouldBeCalledKeyString: {
    code: 1036,
    message: "When calling 'shouldBeCalled', the first parameter must be of type String representing the mock key.",
    type: errorTypes.MaddoxBuildError
  },
  ShouldBeCalledFunctionString: {
    code: 1037,
    message: "When calling 'shouldBeCalled', the second parameter must be of type String representing the function that was mocked.",
    type: errorTypes.MaddoxBuildError
  },
  MissingMockThisFunction: {
    code: 2e3,
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
    code: 3e3,
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
  ResponseMustBePromise: {
    code: 3005,
    message: "When using the 'FromPromiseScenario', the result of the tested code must be a promise following Promise/A+.",
    type: errorTypes.MaddoxRuntimeError
  },
  ResponseCannotBePromise: {
    code: 3006,
    message: "When using the 'FromSynchronousScenario', the result of the tested code can NOT be a promise. See 'FromPromiseScenario' if you want to test a function returning a promise.",
    type: errorTypes.MaddoxRuntimeError
  },
  ResShouldBeCalledWithFunctionString: {
    code: 4e3,
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
  FrameworkRouteMissingRoutes: {
    code: 4005,
    message: "Before executing a FrameworkRouteScenario test, you must call 'addStub' at least once (each stub needs mockName, path, and module.default).",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteModuleDefault: {
    code: 4006,
    message: "When calling 'addStub', 'module' must define a 'default' export (the route Component) for use with createRoutesStub.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteModuleObject: {
    code: 4007,
    message: "When calling 'addStub', the descriptor must include a 'module' object.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRoutePathString: {
    code: 4008,
    message: "When calling 'addStub', the descriptor must include a string 'path' for the stub route.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteAddStubMockName: {
    code: 4013,
    message: "When calling 'addStub', the descriptor must include a string 'mockName' (used for Maddox mock keys).",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteAddStubDescriptor: {
    code: 4014,
    message: "When calling 'addStub', the first parameter must be an object with mockName, path, and module.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteInitialEntriesArray: {
    code: 4009,
    message: "When calling 'withInitialEntries', the parameter must be a non-empty array (e.g. ['/']).",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteNextStepFunction: {
    code: 4010,
    message: "When calling 'next', the parameter must be a function (prefer async) that receives Testing Library context.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteWrapperCallback: {
    code: 4011,
    message: "When calling 'withWrapper', the parameter must be a function (children) => ReactElement that returns a React element wrapping the framework-built Stub element.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteWrapperReturn: {
    code: 4012,
    message: "The function passed to 'withWrapper' must return a React element (e.g. createElement(MyProvider, null, children)).",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteMissingRender: {
    code: 4015,
    message: "FrameworkRouteScenario requires an explicit '.render()' call in the chain before '.test()'. Place '.render()' after all configuration (addStub, mockThisFunction, shouldBeCalledWith, doesReturn*, withInitialEntries, withWrapper) and before any '.next(...)' interaction steps.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteNextBeforeRender: {
    code: 4016,
    message: "'.next(...)' callbacks act on the rendered DOM, so they cannot be chained before '.render()'. Move the '.next(...)' call below '.render()'.",
    type: errorTypes.MaddoxBuildError
  },
  FrameworkRouteConfigAfterRender: {
    code: 4017,
    message: "Scenario configuration ('addStub', 'mockThisFunction', 'shouldBeCalledWith', 'doesReturn*', 'withInitialEntries', 'withWrapper', 'withStubAppContext') takes effect during '.render()' and cannot be chained after '.render()'. Move this configuration call above '.render()'.",
    type: errorTypes.MaddoxBuildError
  },
  TestFailure: {
    code: 4004,
    message: "Your testable function threw an error.",
    type: errorTypes.MaddoxUncheckedError
  },
  FailedSubsetCheck: {
    message: "Failed the subset validation. The subset was not found in the superset."
  }
};
var constants_default = {
  ordinalValues,
  defaults,
  IgnoreParam,
  ResponseMockName,
  ResponseEndFunctions,
  scenarioTypes,
  errorTypes,
  errorMessages
};

// lib/proxies/mocha-proxy.js
var expect = chai.expect;
var Mocha = class _Mocha {
  static #shouldEqual(left, right, message) {
    try {
      expect(left, message).eql(right);
    } catch (err) {
      throw util.isError(left) ? Errr.fromError(left).appendTo(err).throw() : err;
    }
  }
  static #shouldBeTruthy(value, message) {
    expect(value, message).to.be.ok;
  }
  static #shouldBeFalsey(value, message) {
    expect(value, message).to.be.not.ok;
  }
  static #getContext(context) {
    context = context || { noDebug: false };
    context.noDebug = context.noDebug || process.env.NoDebug === "true";
    return context;
  }
  static #appendDiffToTrace(throwable, diff) {
    if (diff && diff.text) {
      let newDiff = diff.text.replace(/\n/g, "\n  ");
      newDiff = newDiff.replace(/\n {2}\x1b/g, "\n    \x1B");
      throwable.stack = throwable.stack + "\n\n  Diff: " + newDiff;
    }
    return throwable;
  }
  /**
   * Does a deep comparison of actual and expected using Chai.js ([Deep Equals](http://chaijs.com/api/bdd/#method_eql).
   * If the comparison fails, it will throw with a pretty printed version of the expected and actual params to the
   * stacktrace. This functionality is provided by the [Errr](https://www.npmjs.com/package/errr) module. If an error
   * message is provided, it will be used in the error message if the comparison fails.
   *
   * @param {Object} actual - The actual value for comparison.
   * @param {Object} expected - The expected value for comparison.
   * @param {String} [message] - The message added to the Errr if the comparison fails.
   * @param {Object} [context] - Holds different configuration options.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append the actual and expected in the stacktrace.
   * Defaults to false.
   * @returns nothing
   */
  static equal(actual, expected, message, context) {
    context = this.#getContext(context);
    try {
      this.#shouldEqual(actual, expected, message);
    } catch (err) {
      const diff = varDiff(actual, expected);
      let throwable = context.noDebug === true ? Errr.newError(err.message).setAll({ actual, expected, diff }).appendTo(err).get() : Errr.newError(err.message).debug({ actual, expected }).setAll({ actual, expected, diff }).appendTo(err).get();
      throwable = this.#appendDiffToTrace(throwable, diff);
      throw throwable;
    }
  }
  /**
   * Validate that the value resolves to truthy using Chai.js ([to.be.ok](http://chaijs.com/api/bdd/#method_ok).
   *
   * @param {Object} value - The value for comparison. If this value is truthy then the test will pass.
   * @param {String} [message] - The message added to the Errr if the comparison fails.
   * @param {Object} [context] - Holds different configuration options.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static truthy(value, message, context) {
    context = this.#getContext(context);
    try {
      this.#shouldBeTruthy(value, message);
    } catch (err) {
      let throwable = context.noDebug === true ? Errr.newError(err.message).appendTo(err).setAll({ actual: value }).get() : Errr.newError(err.message).debug({ actual: value, expected: "Some Truthy Value." }).setAll({ actual: value }).appendTo(err).get();
      throw throwable;
    }
  }
  /**
   * Validate that the value resolves to falsey using Chai.js ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok).
   *
   * @param {Object} value - The value for comparison. If this value is falsey then the test will pass.
   * @param {String} [message] - The message added to the Errr if the comparison fails.
   * @param {Object} [context] - Holds different configuration options.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static falsey(value, message, context) {
    context = this.#getContext(context);
    try {
      this.#shouldBeFalsey(value, message);
    } catch (err) {
      let throwable = context.noDebug === true ? Errr.newError(err.message).appendTo(err).setAll({ actual: value }).get() : Errr.newError(err.message).debug({ actual: value, expected: "Some Falsey Value." }).setAll({ actual: value }).appendTo(err).get();
      throw throwable;
    }
  }
  /**
   * Validates that expected value is a subset (contained within) the actual value. This should work on any nested level
   * object.
   *
   * @param {Object} actual - The actual value for comparison (superset).
   * @param {Object} expected - The expected value for comparison (subset).
   * @param {String} [message] - The message added to the Errr if the comparison fails.
   * @param {Object} [context] - Holds different configuration options.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static subset(actual, expected, message, context) {
    message = message || constants_default.errorMessages.FailedSubsetCheck.message;
    context = this.#getContext(context);
    const isPassing = CoreUtilIs.isString(actual) && CoreUtilIs.isString(expected) && actual.indexOf(expected) !== -1 || isSubset(actual, expected);
    if (!isPassing) {
      let diff = varDiff(actual, expected);
      const split = diff.text.split("\n");
      const startsWithMinus = /\x1b\[[0-9;]+m-/;
      diff.text = split.filter((line) => !startsWithMinus.test(line)).join("\n");
      let throwable = context.noDebug === true ? Errr.newError(message).setAll({ actual, expected, diff }).get() : Errr.newError(message).debug({ actual, expected }).setAll({ actual, expected, diff }).get();
      throwable = this.#appendDiffToTrace(throwable, diff);
      throw throwable;
    }
  }
  /**
   * Synonymous with shouldBeEqual, but with different definition. Does a deep comparison of actual and expected using
   * Chai.js ([Deep Equals](http://chaijs.com/api/bdd/#method_eql). If the comparison fails, it will throw with a pretty
   * printed version of the expected and actual params to the stacktrace. This functionality is provided by the
   * [Errr](https://www.npmjs.com/package/errr) module. If an error message is provided, it will be used in the error
   * message if the comparison fails.
   *
   * @param {Object} context - A context object holding 3 main parameters: actual, expected, and message. Also holds
   * configuration params.
   * @param {Object} context.actual - The actual value for comparison.
   * @param {Object} context.expected - The expected value for comparison.
   * @param {String} [context.message] - The message added to the Errr if the comparison fails.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append the actual and expected in the stacktrace.
   * Defaults to false.
   * @returns nothing
   */
  static shouldEqual(context) {
    _Mocha.equal(context.actual, context.expected, context.message, context);
  }
  /**
   * Synonymous with shouldBeTruthy, but with different definition. Validate that the value resolves to truthy using
   * Chai.js ([to.be.ok](http://chaijs.com/api/bdd/#method_ok).
   *
   * @param {Object} context - A context object holding 2 main parameters: value and message. Also holds
   * configuration params.
   * @param {Object} context.value - The value for comparison. If this value is truthy then the test will pass.
   * @param {String} [context.message] - The message added to the Errr if the comparison fails.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static shouldBeTruthy(context) {
    _Mocha.truthy(context.value, context.message, context);
  }
  /**
   * Synonymous with falsey, but with different definition. Validate that the value resolves to falsey using Chai.js
   * ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok).
   *
   * @param {Object} context - A context object holding 2 main parameters: value and message. Also holds
   * configuration params.
   * @param {Object} context.value - The value for comparison. If this value is falsey then the test will pass.
   * @param {String} [context.message] - The message added to the Errr if the comparison fails.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static shouldBeFalsey(context) {
    _Mocha.falsey(context.value, context.message, context);
  }
  /**
   * Equivalent to 'shouldBeFalsey'. Validate that the value resolves to falsey using Chai.js
   * ([to.not.be.ok](http://chaijs.com/api/bdd/#method_ok).
   *
   * @param {Object} context - A context object holding 2 main parameters: value and message. Also holds
   * configuration params.
   * @param {Object} context.value - The value for comparison. If this value is truthy then the test will pass.
   * @param {String} [context.message] - The message added to the Errr if the comparison fails.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static shouldBeFalsy(context) {
    _Mocha.falsey(context.value, context.message, context);
  }
  /**
   * Function will always fail with a message stating that this line of code should not be executed. A common use case
   * for this would be in the catch block of a test to ensure that you are actually verifying the did not throw. If you
   * do not add some test in a catch block, you are test could be throwing but since you aren't catching it, it could
   * give you a false positive.
   *
   * @param {String} [message] - Define the message to fail with. The default message is: 'It should be impossible to
   * reach this code.'.
   * @returns nothing
   */
  static shouldBeUnreachable(message) {
    message = message || "It should be impossible to reach this code.";
    _Mocha.shouldEqual({ expected: true, actual: false, message, noDebug: true });
  }
  /**
   * Equivalent to the 'subset' function. Validates that expected value is a subset (contained within) the actual value.
   * This should work on any nested level object.
   *
   * @param {Object} context - A context object holding 3 main parameters: actual, expected, and message. Also holds
   * configuration params.
   * @param {Object} actual - The actual value for comparison (superset).
   * @param {Object} expected - The expected value for comparison (subset).
   * @param {String} [context.message] - The message added to the Errr if the comparison fails.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append the actual and expected in the stacktrace.
   * Defaults to false.
   * @returns nothing
   */
  static shouldBeSubset(context) {
    _Mocha.subset(context.actual, context.expected, context.message, context);
  }
};
var mocha_proxy_default = Mocha;

// lib/predicates/should-use-subset.js
import CoreUtilIs2 from "core-util-is";
var ShouldUseSubset = class {
  static assert(mockedFunction, actualResultIndex, actualParamResult, expectedResultsAlwaysWithSubset) {
    return (mockedFunction.shouldBeCalledWithSubsetUsedAtIndex[actualResultIndex] === true || expectedResultsAlwaysWithSubset === true) && (CoreUtilIs2.isArray(actualParamResult) || CoreUtilIs2.isObject(actualParamResult) || CoreUtilIs2.isString(actualParamResult));
  }
};
var should_use_subset_default = ShouldUseSubset;

// lib/plugins/error-factory.js
import util2 from "util";
var ErrorFactory = class {
  static build(errorContext, params) {
    let prefix = `${errorContext.type.prefix} (${errorContext.code}): `;
    let formatParams = params ? [prefix + errorContext.message].concat(params) : [prefix + errorContext.message];
    return util2.format.apply(this, formatParams);
  }
};
var error_factory_default = ErrorFactory;

// lib/mocks/mock.js
import sinon from "sinon";
import Preconditions from "preconditions";
var preconditions = Preconditions.errr();
var ordinalValues2 = constants_default.ordinalValues;
var Mock = class _Mock {
  static #safeClone(obj) {
    try {
      return structuredClone(obj);
    } catch (err) {
      if (Array.isArray(obj)) {
        return obj.map((item) => {
          try {
            return structuredClone(item);
          } catch (e) {
            return item;
          }
        });
      }
      return obj;
    }
  }
  static #getNewMockInfo(objectToMock) {
    return {
      expected: [],
      actual: [],
      doesReturn: [],
      callCount: 0,
      objectToMock,
      shouldBeCalledUsedAtIndex: {},
      shouldBeCalledWithSubsetUsedAtIndex: {}
    };
  }
  constructor(tester) {
    this._mocks_ = {};
    this.tester = tester;
    this.hasTestFinisherBeenExecuted = false;
    this.maddoxRuntimeError = void 0;
  }
  restoreMocks() {
    const mocks = this._mocks_;
    const mockKeys = Object.keys(mocks);
    mockKeys.forEach((mockName) => {
      const mockedFunctions = mocks[mockName];
      const mockedFunctionsKeys = Object.keys(mockedFunctions || {});
      mockedFunctionsKeys.forEach((funcName) => {
        if (mocks[mockName][funcName].objectToMock[funcName].restore) {
          mocks[mockName][funcName].objectToMock[funcName].restore();
        }
      });
    });
  }
  restoreMockCallCounts() {
    this.hasTestFinisherBeenExecuted = false;
    const mocks = this._mocks_;
    const mockKeys = Object.keys(mocks);
    mockKeys.forEach((mockName) => {
      const mockedFunctions = mocks[mockName];
      const mockedFunctionsKeys = Object.keys(mockedFunctions || {});
      mockedFunctionsKeys.forEach((funcName) => {
        mocks[mockName][funcName].callCount = 0;
      });
    });
  }
  promiseResult(mockName, funcName, mockedData) {
    return mockedData.isError ? Promise.reject(mockedData.dataToReturn) : Promise.resolve(mockedData.dataToReturn);
  }
  callbackResult(mockName, funcName, mockedData, args) {
    var callback = args[args.length - 1];
    try {
      const message = error_factory_default.build(constants_default.errorMessages.MissingCallback, [mockName, funcName]);
      preconditions.shouldBeFunction(callback, message).debug({ callbackType: typeof callback }).test();
    } catch (err) {
      this.setMaddoxRuntimeError(err);
      throw err;
    }
    delete args[args.length - 1];
    callback.apply(this, mockedData.dataToReturn);
  }
  synchronousResult(mockName, funcName, mockedData) {
    if (mockedData.isError) {
      throw mockedData.dataToReturn;
    } else {
      return mockedData.dataToReturn;
    }
  }
  doesReturn(mockName, funcName, dataToReturn, returnType, isError) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    this._mocks_[mockName][funcName].doesReturn.push({
      dataToReturn,
      dataReturnType: returnType,
      isError
    });
  }
  doesAlwaysReturn(mockName, funcName, dataToReturn, returnType, isError) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    this._mocks_[mockName][funcName].doesAlwaysReturn = {
      dataToReturn,
      dataReturnType: returnType,
      isError
    };
  }
  shouldBeCalledWith(mockName, funcName, params) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    const args = {};
    const paramKeys = Object.keys(params);
    paramKeys.forEach((paramKey) => {
      args[paramKey] = params[paramKey];
    });
    this._mocks_[mockName][funcName].expected.push(args);
  }
  shouldBeCalledWithSubset(mockName, funcName, params) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    const args = {};
    const paramKeys = Object.keys(params);
    paramKeys.forEach((paramKey) => {
      args[paramKey] = params[paramKey];
    });
    this._mocks_[mockName][funcName].expected.push(args);
    const index = this._mocks_[mockName][funcName].expected.length - 1;
    this._mocks_[mockName][funcName].shouldBeCalledWithSubsetUsedAtIndex[index] = true;
  }
  shouldBeCalled(mockName, funcName) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    this._mocks_[mockName][funcName].expected.push([]);
    const index = this._mocks_[mockName][funcName].expected.length - 1;
    this._mocks_[mockName][funcName].shouldBeCalledUsedAtIndex[index] = true;
  }
  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    const args = {};
    const paramKeys = Object.keys(params);
    paramKeys.forEach((paramKey) => {
      args[paramKey] = params[paramKey];
    });
    this._mocks_[mockName][funcName].expectedAlways = args;
  }
  shouldAlwaysBeCalledWithSubset(mockName, funcName, params) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    const args = {};
    const paramKeys = Object.keys(params);
    paramKeys.forEach((paramKey) => {
      args[paramKey] = params[paramKey];
    });
    this._mocks_[mockName][funcName].expectedWithSubset = true;
    this._mocks_[mockName][funcName].expectedAlways = args;
  }
  shouldAlwaysBeIgnored(mockName, funcName) {
    const message = error_factory_default.build(constants_default.errorMessages.MissingMockThisFunction, [mockName, funcName]);
    preconditions.shouldBeDefined(this._mocks_[mockName], message).debug({ mockName, funcName }).test();
    preconditions.shouldBeDefined(this._mocks_[mockName][funcName], message).debug({ mockName, funcName }).test();
    this._mocks_[mockName][funcName].shouldAlwaysBeIgnored = true;
  }
  setResponseEndFunction(mockName, funcName, iteration) {
    iteration = iteration || 0;
    this._mocks_[mockName][funcName].responseEnd = true;
    this._mocks_[mockName][funcName].iteration = iteration;
  }
  clearAllResponseEndFunction() {
    const mocks = this._mocks_;
    const mockKeys = Object.keys(mocks);
    mockKeys.forEach((mockName) => {
      const mockedFunctions = mocks[mockName];
      const mockedFunctionsKeys = Object.keys(mockedFunctions || {});
      mockedFunctionsKeys.forEach((funcName) => {
        delete mocks[mockName][funcName].responseEnd;
        delete mocks[mockName][funcName].iteration;
      });
    });
  }
  mockThisFunctionAtMostOnce(mockName, funcName, objectToMock) {
    if (!this._mocks_[mockName] || !this._mocks_[mockName][funcName]) {
      this.mockThisFunction(mockName, funcName, objectToMock);
    }
  }
  mockThisFunction(mockName, funcName, objectToMock) {
    preconditions.shouldBeDefined(
      objectToMock[funcName],
      error_factory_default.build(constants_default.errorMessages.FunctionNotInMock, [funcName, mockName])
    ).test();
    this._mocks_[mockName] = this._mocks_[mockName] || {};
    preconditions.shouldBeUndefined(
      this._mocks_[mockName][funcName],
      error_factory_default.build(constants_default.errorMessages.MockAlreadyExists, [mockName, funcName])
    ).test();
    this._mocks_[mockName][funcName] = _Mock.#getNewMockInfo(objectToMock);
    if (objectToMock[funcName].isSinonProxy) {
      objectToMock[funcName].restore();
    }
    sinon.stub(objectToMock, funcName).callsFake(
      function() {
        const argsArr = Array.prototype.slice.call(arguments);
        const args = _Mock.#safeClone(argsArr);
        const mock = this._mocks_[mockName][funcName];
        const mockedData = mock.doesAlwaysReturn || mock.doesReturn[mock.callCount];
        if (!this.hasTestFinisherBeenExecuted) {
          mock.actual.push(args);
          try {
            const message = error_factory_default.build(constants_default.errorMessages.MissingMockedData, [
              ordinalValues2[mock.callCount],
              mockName,
              funcName
            ]);
            preconditions.shouldBeDefined(mockedData, message).debug({ args }).test();
            preconditions.shouldBeDefined(mockedData.dataToReturn, message).debug({ args }).test();
          } catch (err) {
            this.setMaddoxRuntimeError(err);
            throw err;
          }
        }
        if (mock.responseEnd && mock.iteration === mock.callCount && !this.hasTestFinisherBeenExecuted) {
          this.hasTestFinisherBeenExecuted = true;
          if (this.resolveForResponseEnd) {
            this.resolveForResponseEnd();
          }
        }
        mock.callCount = mock.callCount + 1;
        return this[mockedData.dataReturnType](mockName, funcName, mockedData, args);
      }.bind(this)
    );
  }
  wasFinisherFunctionExecuted() {
    return this.hasTestFinisherBeenExecuted;
  }
  setCallbackForResponseEnd(resolveForResponseEnd) {
    this.resolveForResponseEnd = resolveForResponseEnd;
  }
  setMaddoxRuntimeError(error) {
    this.maddoxRuntimeError = error;
  }
  getMaddoxRuntimeError() {
    return this.maddoxRuntimeError;
  }
  noDebug() {
    this._noDebug_ = true;
  }
  test() {
    const mocks = this._mocks_;
    this._responseMocks_ = this._mocks_[constants_default.ResponseMockName];
    delete this._mocks_[constants_default.ResponseMockName];
    const mockKeys = Object.keys(mocks);
    mockKeys.forEach((mockName) => {
      const mockedFunctions = mocks[mockName];
      this.testMock(mockedFunctions, mockName);
    });
    this.testMock(this._responseMocks_, constants_default.ResponseMockName);
    this._mocks_[constants_default.ResponseMockName] = this._responseMocks_;
  }
  testMock(mockedFunctions, mockName) {
    const mockedFunctionKeys = Object.keys(mockedFunctions || {});
    mockedFunctionKeys.forEach((funcName) => {
      const mockedFunction = mockedFunctions[funcName];
      let actualResults = mockedFunction.actual;
      let expectedResults = mockedFunction.expected;
      let expectedResultsFromShouldAlways = mockedFunction.expectedAlways;
      let expectedResultsAlwaysWithSubset = mockedFunction.expectedWithSubset;
      let shouldAlwaysBeIgnored = mockedFunction.shouldAlwaysBeIgnored;
      if (shouldAlwaysBeIgnored) {
        return;
      }
      if (!expectedResultsFromShouldAlways) {
        try {
          const message = error_factory_default.build(constants_default.errorMessages.MockCalledWrongNumberOfTimes, [
            mockName,
            funcName,
            expectedResults.length,
            actualResults.length
          ]);
          preconditions.checkArgument(actualResults.length === expectedResults.length, message).test();
        } catch (err) {
          this.setMaddoxRuntimeError(err);
          throw err;
        }
      }
      const actualResultsKeys = Object.keys(actualResults);
      actualResultsKeys.forEach((actualResultIndex) => {
        const actualResult = actualResults[actualResultIndex];
        let countOrdinalValue = ordinalValues2[actualResultIndex] || actualResultIndex, expectedResult = expectedResultsFromShouldAlways || expectedResults[actualResultIndex], numActualParams = 0, numExpectedParams = 0;
        if (mockedFunction.shouldBeCalledUsedAtIndex[actualResultIndex] !== true) {
          const actualResultKeys = Object.keys(actualResult);
          actualResultKeys.forEach((actualParamResultIndex) => {
            const actualParamResult = actualResult[actualParamResultIndex];
            if (actualParamResult) {
              numActualParams++;
            }
            let paramOrdinalValue = ordinalValues2[actualParamResultIndex] || actualResultIndex, expectedParamResult, usingShouldAlways;
            if (expectedResultsFromShouldAlways && expectedResultsFromShouldAlways[actualParamResultIndex]) {
              expectedParamResult = expectedResultsFromShouldAlways[actualParamResultIndex];
              usingShouldAlways = true;
            } else {
              expectedParamResult = expectedResult ? expectedResult[actualParamResultIndex] : expectedResult;
              usingShouldAlways = false;
            }
            funcName = mockName === constants_default.ResponseMockName ? `${funcName} (i.e. res.${funcName})` : funcName;
            let message = error_factory_default.build(constants_default.errorMessages.ComparisonShouldEqual, [
              paramOrdinalValue,
              mockName,
              funcName,
              countOrdinalValue
            ]);
            if (expectedParamResult !== constants_default.IgnoreParam) {
              try {
                if (should_use_subset_default.assert(
                  mockedFunction,
                  actualResultIndex,
                  actualParamResult,
                  expectedResultsAlwaysWithSubset
                )) {
                  this.tester.shouldBeSubset({
                    actual: actualParamResult,
                    expected: expectedParamResult,
                    message,
                    usingShouldAlways,
                    noDebug: this._noDebug_
                  });
                } else {
                  this.tester.shouldEqual({
                    actual: actualParamResult,
                    expected: expectedParamResult,
                    message,
                    usingShouldAlways,
                    noDebug: this._noDebug_
                  });
                }
              } catch (comparisonError) {
                this.setMaddoxRuntimeError(comparisonError);
                throw comparisonError;
              }
            }
          });
        }
        const expectedResultKeys = Object.keys(expectedResult);
        expectedResultKeys.forEach((expectedResultKey) => {
          const expectedParamResult = expectedResult[expectedResultKey];
          if (expectedParamResult) {
            numExpectedParams++;
          }
        });
        try {
          const message = error_factory_default.build(constants_default.errorMessages.WrongNumberOfParams, [
            countOrdinalValue,
            mockName,
            funcName,
            numExpectedParams,
            numActualParams
          ]);
          preconditions.checkArgument(numActualParams === numExpectedParams, message).test();
        } catch (err) {
          this.setMaddoxRuntimeError(err);
          throw err;
        }
      });
    });
  }
};
Mock.PromiseType = "promiseResult";
Mock.CallbackType = "callbackResult";
Mock.SynchronousType = "synchronousResult";
var mock_default = Mock;

// lib/steps/execute-test.js
var ExecuteTest = class {
  static next(state) {
    return new Promise((resolve, reject) => {
      const mock = state._getMock_();
      const shouldExecuteTest = state._shouldExecuteTest_();
      const runnable = state._getTestRunnable_();
      if (shouldExecuteTest) {
        runnable().then((result) => {
          const maddoxRuntimeError = mock.getMaddoxRuntimeError();
          if (maddoxRuntimeError !== void 0) {
            reject(maddoxRuntimeError);
          } else {
            state._setTestResult_(result);
            resolve();
          }
        }).catch((err) => {
          const maddoxRuntimeError = mock.getMaddoxRuntimeError();
          if (maddoxRuntimeError !== void 0) {
            reject(maddoxRuntimeError);
          } else {
            state._setError_(err);
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};
var execute_test_default = ExecuteTest;

// lib/steps/wait-for-test-finisher.js
var FinisherFunction = class {
  static validate(mock) {
    return new Promise((resolve) => {
      function wasFinisherFunctionExecuted() {
        if (mock.wasFinisherFunctionExecuted()) {
          resolve();
        } else {
          wait();
        }
      }
      function wait() {
        setTimeout(() => {
          wasFinisherFunctionExecuted();
        }, 5);
      }
      wait();
    });
  }
};
var ExecuteTest2 = class {
  static next(state) {
    return new Promise((resolve) => {
      const hasManualFinisherFunction = state._hasManualFinisherFunction_();
      const shouldExecuteTest = state._shouldExecuteTest_();
      const mock = state._getMock_();
      if (hasManualFinisherFunction && shouldExecuteTest) {
        FinisherFunction.validate(mock).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
};
var wait_for_test_finisher_default = ExecuteTest2;

// lib/steps/test-mocks.js
var TestMocks = class {
  static next(state) {
    const shouldExecuteTest = state._shouldExecuteTest_();
    const mock = state._getMock_();
    if (shouldExecuteTest) {
      mock.test();
    }
  }
};
var test_mocks_default = TestMocks;

// lib/proxies/report-proxy.js
var ReportProxy = class {
  static addNewReport(title, result) {
    process.maddox.currentReport[title] = result;
  }
};
var report_proxy_default = ReportProxy;

// lib/perf/maddox-perf.js
import SimpleStatistics from "simple-statistics";
var MaxPerSample = 1e3;
var AcceptableZScore = 1.645;
var Stats = class {
  static get(samples) {
    const allTimes = [];
    const allNumPerSecond = [];
    for (let sample of samples) {
      for (let time of sample) {
        allTimes.push(time);
        allNumPerSecond.push(1 / time);
      }
    }
    const allTimesSd = SimpleStatistics.standardDeviation(allTimes);
    const allTimesMean = SimpleStatistics.mean(allTimes);
    const allNumPerSecondSd = SimpleStatistics.standardDeviation(allNumPerSecond);
    const allNumPerSecondMean = SimpleStatistics.mean(allNumPerSecond);
    const allTimesLow = allTimesMean - AcceptableZScore * allTimesSd;
    const allTimesHigh = allTimesMean + AcceptableZScore * allTimesSd;
    const allNumPerSecondLow = allNumPerSecondMean - AcceptableZScore * allNumPerSecondSd;
    const allNumPerSecondHigh = allNumPerSecondMean + AcceptableZScore * allNumPerSecondSd;
    const allTimesAcceptable = [];
    const allNumPerSecondAcceptable = [];
    let droppedAllTimesCount = 0;
    let droppedNumPerSecondCount = 0;
    for (let i = 0; i < allTimes.length; i++) {
      if (allTimes[i] > allTimesLow && allTimes[i] < allTimesHigh) {
        allTimesAcceptable.push(allTimes[i]);
      } else {
        droppedAllTimesCount++;
      }
      if (allNumPerSecond[i] > allNumPerSecondLow && allNumPerSecond[i] < allNumPerSecondHigh) {
        allNumPerSecondAcceptable.push(allTimes[i]);
      } else {
        droppedNumPerSecondCount++;
      }
    }
    const stats = {
      date: /* @__PURE__ */ new Date(),
      time: {
        mean: SimpleStatistics.mean(allTimes),
        median: SimpleStatistics.median(allTimes),
        standardDeviation: SimpleStatistics.standardDeviation(allTimes),
        variance: SimpleStatistics.variance(allTimes),
        dropped: droppedAllTimesCount
      },
      numPerSecond: {
        mean: SimpleStatistics.mean(allNumPerSecond),
        median: SimpleStatistics.median(allNumPerSecond),
        standardDeviation: SimpleStatistics.standardDeviation(allNumPerSecond),
        variance: SimpleStatistics.variance(allNumPerSecond),
        dropped: droppedNumPerSecondCount
      },
      totalSampleSize: allTimes.length
    };
    stats.time.standardError = Math.floor(
      1e3 * (stats.time.standardDeviation / Math.sqrt(stats.totalSampleSize)) / stats.time.mean / 10
    );
    stats.numPerSecond.standardError = Math.floor(
      1e3 * (stats.numPerSecond.standardDeviation / Math.sqrt(stats.totalSampleSize)) / stats.numPerSecond.mean / 10
    );
    return stats;
  }
};
var PerfTest = class {
  constructor(context) {
    this.context = context;
  }
  run() {
    return new Promise((resolve) => {
      const samplesDone = (samples) => {
        resolve(Stats.get(samples));
      };
      Samples.new(this.context, samplesDone).run();
    });
  }
};
var Samples = class _Samples {
  constructor(context, samplesDone) {
    this.context = context;
    this.samplesDone = samplesDone;
    this.totalSamples = 0;
    this.samples = [];
  }
  sampleDone(stats) {
    this.totalSamples++;
    this.samples.push(stats);
    if (this.totalSamples === this.context.numSamples) {
      this.samplesDone(this.samples);
    } else {
      this.run();
    }
  }
  run() {
    process.nextTick(() => {
      Sample.new(this.context, this.sampleDone.bind(this)).run();
    });
  }
  static new(context, samplesDone) {
    return new _Samples(context, samplesDone);
  }
};
var Sample = class _Sample {
  constructor(context, sampleDone) {
    this.context = context;
    this.sampleDone = sampleDone;
    this.timerCompleted = false;
    this.stats = [];
  }
  runOne() {
    setTimeout(() => {
      const startTime = process.hrtime();
      this.context.runnable(() => {
        const diff = process.hrtime(startTime);
        this.stats.push((diff[0] * 1e9 + diff[1]) / 1e9);
        if (this.timerCompleted || this.stats.length - 1 === MaxPerSample) {
          this.sampleDone(this.stats);
        } else {
          this.runOne();
        }
      });
    }, 5);
  }
  run() {
    setTimeout(() => {
      this.timerCompleted = true;
    }, this.context.sampleTime);
    this.runOne();
  }
  static new(context, sampleDone) {
    return new _Sample(context, sampleDone);
  }
};
var maddox_perf_default = {
  newPerfTest: (context) => {
    return new PerfTest(context);
  }
};

// lib/steps/execute-perf.js
var ExecutePerfTest = class {
  static next(state) {
    return new Promise((resolve, reject) => {
      const shouldExecutePerfTest = state._shouldExecutePerfTest_();
      const testTitle = state._getTestTitle_();
      const runnable = state._getPerfRunnable_();
      if (shouldExecutePerfTest) {
        const context = {
          numSamples: process.maddox.numSamples,
          sampleTime: process.maddox.sampleLength,
          runnable
        };
        maddox_perf_default.newPerfTest(context).run().then((stats) => {
          report_proxy_default.addNewReport(testTitle, stats);
          resolve();
        }).catch((err) => {
          reject(err);
        });
      } else {
        resolve();
      }
    });
  }
};
var execute_perf_default = ExecutePerfTest;

// lib/steps/finish-test.js
var FinishTest = class {
  static async next(state) {
    const mock = state._getMock_();
    const error = state._getError_();
    const testable = state._getTestable_();
    const testResult = state._getTestResult_();
    state._executingTestable_();
    await testable(error, testResult);
    mock.restoreMocks();
  }
};
var finish_test_default = FinishTest;

// lib/steps/skip-test.js
var SkipTest = class {
  static next(state) {
    const isPerformanceTest = state._isPerformanceTest_();
    if (isPerformanceTest && state.skipTest) {
      state.skipTest();
    }
  }
};
var skip_test_default = SkipTest;

// lib/steps/handle-error.js
import Errr2 from "errr";
var HandleError = class {
  static next(state, err) {
    const mock = state._getMock_();
    const testable = state._getTestable_();
    const hasTestableBeenExecuted = state._hasTestableBeenExecuted_();
    const executionError = state._getError_();
    const maddoxRuntimeError = mock.getMaddoxRuntimeError();
    mock.restoreMocks();
    if (hasTestableBeenExecuted) {
      Errr2.newError(error_factory_default.build(constants_default.errorMessages.TestFailure)).appendTo(err).throw();
    } else if (maddoxRuntimeError) {
      const errr = Errr2.fromError(maddoxRuntimeError);
      if (executionError) {
        errr.appendTo(executionError);
      }
      errr.throw();
    } else {
      const errr = Errr2.fromError(err);
      if (executionError) {
        errr.appendTo(executionError);
      }
      testable(errr.get());
    }
  }
};
var handle_error_default = HandleError;

// lib/scenarios/scenario.js
var preconditions2 = Preconditions2.errr();
var Scenario = class {
  constructor(testContext) {
    this._tester_ = mocha_proxy_default;
    this._mock_ = new mock_default(this._tester_);
    this._flaggedForPerfTest_ = false;
    this._testableExecuted_ = false;
    this._foundMaddoxRuntimeError_ = false;
    this._usingManualFinisherFunction_ = false;
    this._inputParams_ = void 0;
    this._entryPointObject_ = void 0;
    this._entryPointFunction_ = void 0;
    this._testTitle_ = void 0;
    this._testResult_ = void 0;
    this._testRunnable_ = void 0;
    this._testContext_ = testContext;
    if (this._testContext_) {
      preconditions2.shouldBeDefined(this._testContext_.skip, error_factory_default.build(constants_default.errorMessages.IllegalMochaThisContext)).test();
      this.skipTest = this._testContext_.skip.bind(this._testContext_);
      this._testTitle_ = this._testContext_.test.fullTitle();
    }
  }
  /**
   * Mock any function from a given object.  The most common use case would be to mock out a function in your proxy layer.
   *
   * @param {String} mockName - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
   * @param {String} funcName - The name of the function to be mocked.
   * @param {Object} object - The object that contains the function to be mocked.
   * @returns {Scenario}
   */
  mockThisFunction(mockName, funcName, object) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.MockThisFunctionMockString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.MockThisFunctionString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeObject(object, error_factory_default.build(constants_default.errorMessages.MockThisFunctionObject)).debug({ mockName, funcName, object }).test();
    console.log("mockThisFunction", mockName, funcName, object);
    this._mock_.mockThisFunction(mockName, funcName, object);
    return this;
  }
  /**
   * Set a mocked proxy function as the finisher function for the test. When the finisher function is executed, the test
   * will be considered complete, the mocks will begin being tested, and then the provided testable function will be
   * executed. i.e. By setting this function, you are telling Maddox when the test is complete.
   *
   * A common use case for using this function, is if you want to execute a set of code asynchronously but you don't care
   * about the result. For Example: Let's say you want to call an HTTP endpoint to execute some code, but you want the
   * HTTP endpoint to provide an immediate acknowledgement. In other words, you want to end the HTTP Request without
   * waiting for the code behind the Http endpoint to be finished. Even though you want the HTTP request to finish
   * immediately, you still want to test that the other mocks are called with the expected parameters. Normally when using
   * the HttpReqScenario, your finisher function is automatically assigned within Maddox. Often the finisher function
   * will be res.send, because that is the function that is commonly used to finish Http Requests via Express. This
   * function will now tell Maddox that the execution is complete, and that Maddox can begin testing the mocks. By
   * setting a finisher function, you are now telling Maddox to wait until finisher function has been executed before
   * beginning to test the mocks.
   *
   * As always, there are detailed examples in the unit tests of Maddox to see how this can be used. But I will also be
   * publishing specific examples of this use case since it isn't that common.
   *
   * @param {String} mockName - This is the key for the mock. It will be used again in other functions and is used in Maddox to keep track of mocks.
   * @param {String} funcName - The name of the function to be mocked.
   * @param {Number} [iteration] - Defaults to 0. The finisher function will be executed the nth time this mocked proxy
   * function is executed. Iterations start at 0. So if you want the finisher function to called on the second time a
   * mocked proxy is called, then you would pass in 1.
   * @returns {Scenario}
   *
   */
  withTestFinisherFunction(mockName, funcName, iteration) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.MockThisFunctionMockString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.MockThisFunctionString)).debug({ mockName, funcName }).test();
    this._mock_.clearAllResponseEndFunction();
    this._mock_.setResponseEndFunction(mockName, funcName, iteration);
    this._finishedHasBeenSet_ = true;
    this._usingManualFinisherFunction_ = true;
    return this;
  }
  /**
   * Defines where to begin the test.
   *
   * @param {Object} entryPointObject - The object to start the test from.
   * @param {String} entryPointFunction - The function within the object to start the test from.
   * @returns {Scenario}
   */
  withEntryPoint(entryPointObject, entryPointFunction) {
    preconditions2.shouldBeObject(entryPointObject, error_factory_default.build(constants_default.errorMessages.EntryPointObject)).debug({ entryPointObject, entryPointFunction }).test();
    preconditions2.shouldBeString(entryPointFunction, error_factory_default.build(constants_default.errorMessages.EntryPointString)).debug({ entryPointObject, entryPointFunction }).test();
    preconditions2.shouldBeFunction(
      entryPointObject[entryPointFunction],
      error_factory_default.build(constants_default.errorMessages.EntryPointFunction)
    ).debug({ entryPointObject, entryPointFunction }).test();
    this._entryPointObject_ = entryPointObject;
    this._entryPointFunction_ = entryPointObject[entryPointFunction];
    return this;
  }
  /**
   * These are the input params into the function that you would like to test. The input params is an array representation
   * of all the parameters.
   *
   * @param {Array} inputParamsIn - Array of parameters. The first function parameter goes into index 0 and the nth parameter goes into index n.
   * @returns {Scenario}
   */
  withInputParams(inputParamsIn) {
    preconditions2.shouldBeArray(inputParamsIn, error_factory_default.build(constants_default.errorMessages.InputParamsArray)).debug({ inputParamsIn }).test();
    this._inputParams_ = inputParamsIn;
    return this;
  }
  /**
   * Defines an expectation for a mocked function. i.e. after your test is complete, Maddox will compare the actual
   * parameters the mock was called with to the defined expected parameters from this function.  If a mocked function
   * (from 'mockThisFunction') is called once, then 'shouldBeCalledWith' should be defined once for that mocked function.
   * If a mocked function is called 'n' times, then 'shouldBeCalledWith' should be defined 'n' times for that mocked function.
   *
   * Ordering matters when defining these expectations. If your function is called 3 times, Maddox will compare the first
   * set of actual parameters to the first set of defined expected parameters and so on.
   *
   * If your function takes a callback you should NOT add this to the params array. The callback will be automatically
   * validated during execution when you use 'doesReturnWithCallback'.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldBeCalledWith(mockName, funcName, params) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ mockName, funcName, params }).test();
    this._mock_.shouldBeCalledWith(mockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function. If a parameter value is an array or a json object,
   * then the provided parameters must be a subset of the actual arguments that were passed into the function. If
   * any of the provided parameters are of any other type, then they must be an identical match.
   *
   * Two arrays or two objects that are identical will pass the subset validation.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldBeCalledWithSubset(mockName, funcName, params) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ mockName, funcName, params }).test();
    this._mock_.shouldBeCalledWithSubset(mockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function should be called, but does not validate any of the
   * parameters it was called with. It will only validate the the mock was called.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {Scenario}
   */
  shouldBeCalled(mockName, funcName) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledFunctionString)).debug({ mockName, funcName }).test();
    this._mock_.shouldBeCalled(mockName, funcName);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function should be called with the same expected parameters
   * on every call to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ mockName, funcName, params }).test();
    this._mock_.shouldAlwaysBeCalledWith(mockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function should be called with the same expected parameters
   * on every call to the mock.  If a parameter value is an array or a json object, then the provided parameters
   * must be a subset of the actual arguments that were passed into the function. If any of the provided
   * parameters are of any other type, then they must be an identical match.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {Scenario}
   */
  shouldAlwaysBeCalledWithSubset(mockName, funcName, params) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ mockName, funcName, params }).test();
    this._mock_.shouldAlwaysBeCalledWithSubset(mockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines the parameters being passed into a given mocked function should never
   * be tested.
   *
   * I was hesitant to add this functionality as it can easily be abused. That being said, there are some valid use cases
   * but you should always think twice before using this function as you are essentially saying that you do not care
   * about testing this mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {Scenario}
   */
  shouldAlwaysBeIgnored(mockName, funcName) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithKeyString)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName, funcName }).test();
    this._mock_.shouldAlwaysBeIgnored(mockName, funcName);
    return this;
  }
  /**
   * Defines what to return during a success scenario from a **synchronous** mocked function.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  doesReturn(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesReturnDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.SynchronousType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function. The dataToReturn will be
   * returned on every execution of the mock. That means you only need to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  doesAlwaysReturn(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesReturnDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, mock_default.SynchronousType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that
   * returns a **promise**.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed. This data will
   * be available in the next step of your promise chain.
   * @returns {Scenario}
   */
  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.PromiseType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario that
   * returns a **promise**. The dataToReturn will be returned on every execution of the mock. That means you only need
   * to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed. This data will
   * be available in the next step of your promise chain.
   * @returns {Scenario}
   */
  doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesReturnPromiseDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, mock_default.PromiseType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario
   * that expects results to be returned in a **callback**.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be
   * added in the callback function.
   *
   * Every 'shouldBeCalledWith' or any of its variants need to be matched with a 'doesReturn' or one of its variants. Why?
   * For every mocked function, we test that it is called with the expected, and then return something from the mocked
   * function to continue driving the scenario through your code.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} dataToReturn - An array of parameters that will be applied (.apply) to the provided callback function.
   * @returns {Scenario}
   */
  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = Object.is(JSON.stringify(dataToReturn, null, 2), "{}") ? [] : dataToReturn;
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnCallbackMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnCallbackFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesReturnCallbackDataToReturn)).debug({ mockName, funcName, dataToReturn }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.CallbackType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a success scenario
   * that expects results to be returned in a **callback**. The dataToReturn will be returned on every execution of the
   * mock. That means you only need to define one return value for all calls to the mock.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * The dataToReturn property for 'doesReturnWithCallback' needs to be an array to allow any any number parameters to be
   * added in the callback function.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} dataToReturn - An array of parameters that will be applied (.apply) to the provided callback function.
   * @returns {Scenario}
   */
  doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = Object.is(JSON.stringify(dataToReturn, null, 2), "{}") ? [] : dataToReturn;
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesReturnCallbackMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnCallbackFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesAlwaysReturnCallbackDataToReturn)).debug({ mockName, funcName, dataToReturn }).test();
    this._mock_.doesAlwaysReturn(mockName, funcName, dataToReturn, mock_default.CallbackType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. Defines what to return during a failure scenario from a **synchronous** mocked
   * function. To force the error scenario, the mocked function will throw the dataToReturn. Best practice dictates
   * that you only throw Javascript Error objects. Therefore, you should be providing a Node Error object in the
   * dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be thrown.
   * @returns {Scenario}
   */
  doesError(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesErrorMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesErrorFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesErrorDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.SynchronousType, true);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that
   * returns a **promise**. To force the error scenario, the mocked function will reject using the dataToReturn causing
   * the first catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript
   * Error objects. Therefore, you should be providing a Node Error object in the dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be rejected.
   * @returns {Scenario}
   */
  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesErrorPromiseMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesErrorPromiseFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeDefined(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesErrorPromiseDataToReturn)).debug({ mockName, funcName }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.PromiseType, true);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario
   * that expects results to be returned in a **callback**. There is absolutely no difference between 'doesErrorWithCallback'
   * and 'doesReturnWithCallback'. It is instead up to user to define the response parameters in the dataToReturn
   * array. In other words, if you want an error scenario, you just need to ensure the err object is defined in your
   * dataToReturn array of parameters.
   *
   * Maddox currently enforces a common paradigm for having the callback function be the last parameter. If you have a
   * function that expects a callback, the callback must be the last parameter. Maddox will grab the callback from the
   * last parameter and execute it with the provided dataToReturn.
   *
   * This is a variant of 'doesReturn'. It defines what to return from a mocked function during a failure scenario that
   * returns a **promise**. To force the error scenario, the mocked function will throw the dataToReturn causing the first
   * catch block to be invoked in your promise chain. Best practice dictates that you only throw Javascript Error
   * objects. Therefore, you should be providing a Node Error object in the dataToReturn property.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Error} dataToReturn - The Error object to be passed into .
   * @returns {Scenario}
   */
  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    dataToReturn = Object.is(JSON.stringify(dataToReturn, null, 2), "{}") ? [] : dataToReturn;
    preconditions2.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.DoesErrorCallbackMockName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesErrorCallbackFuncName)).debug({ mockName, funcName }).test();
    preconditions2.shouldBeArray(dataToReturn, error_factory_default.build(constants_default.errorMessages.DoesErrorCallbackDataToReturn)).debug({ mockName, funcName, dataToReturn }).test();
    this._mock_.doesReturn(mockName, funcName, dataToReturn, mock_default.CallbackType, true);
    return this;
  }
  _validate(done) {
    preconditions2.shouldBeFunction(done, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ done }).test();
    preconditions2.shouldBeDefined(this._entryPointObject_, error_factory_default.build(constants_default.errorMessages.MissingEntryPoint)).debug({ _entryPointObject_: this._entryPointObject_ }).test();
  }
  /**
   * By default, when a comparison fails, Maddox will place a stringified version of the actual and expected results
   * into the stack trace so the user can see what is wrong.  When noDebug is added to a scenario, Maddox will no longer
   * provide the expected and actual in the stack trace debug params.
   * @returns {Scenario}
   */
  noDebug() {
    this._mock_.noDebug();
    return this;
  }
  perf() {
    return this.performance();
  }
  performance() {
    preconditions2.shouldBeDefined(this._testContext_, error_factory_default.build(constants_default.errorMessages.MissingMochaTestContext)).test();
    this._flagAsPerfTest_();
    return this;
  }
  _resetScenario_() {
    this._mock_.restoreMockCallCounts();
  }
  _setError_(err) {
    this._err_ = err;
  }
  _setTestTitle_(testTitle) {
    this._testTitle_ = testTitle;
  }
  _flagAsPerfTest_() {
    this._flaggedForPerfTest_ = true;
  }
  _setTestResult_(testResult) {
    this._testResult_ = testResult;
  }
  _setTestable_(testable) {
    this._testable_ = testable;
  }
  _executingTestable_() {
    this._testableExecuted_ = true;
  }
  _getError_() {
    return this._err_;
  }
  _getTestTitle_() {
    return this._testTitle_;
  }
  _getTestResult_() {
    return this._testResult_;
  }
  _getInputParams_() {
    return this._inputParams_;
  }
  _getTestRunnable_() {
    return this._testRunnable_;
  }
  _getEntryPointFunction_() {
    return this._entryPointFunction_;
  }
  _getMock_() {
    return this._mock_;
  }
  _getTestable_() {
    return this._testable_;
  }
  _getPerfRunnable_() {
    return this._perfRunnable_;
  }
  _getScenarioType_() {
    return this._scenarioType_;
  }
  _shouldExecuteTest_() {
    return !process.maddox || process.maddox.perf !== true;
  }
  _shouldExecutePerfTest_() {
    return this._isPerformanceTest_() && this._flaggedForPerfTest_;
  }
  _isPerformanceTest_() {
    return process.maddox && process.maddox.perf === true;
  }
  _hasManualFinisherFunction_() {
    return this._usingManualFinisherFunction_;
  }
  _hasFinishedBeenSet_() {
    return this._finishedHasBeenSet_;
  }
  _hasTestableBeenExecuted_() {
    return this._testableExecuted_;
  }
  accept(step, err) {
    return Promise.resolve().then(() => {
      return step.next(this, err);
    });
  }
  /**
   * Initiates the test. This will call the entry point function with given input params. When the function is done
   * executing, it will test that all of mocked functions were called with the expected parameters, and then call the
   * testable function that was the parameter for the test function.
   *
   * If testing the HttpReqScenario, Maddox call into the controller function using your input params as the request and
   * mocking out the response for you. When a response finishing function (i.e. send, json, end, etc) is called on the
   * response object, Maddox will begin validating the request. It will first test that all functions mocked on the response
   * were called with the expected values. Next it will test that all of mocked functions were called with the expected
   * parameters. And finally it will call function that was the parameter for the test function. Usually for the
   * HttpReqScenario, you can just pass in the 'done' function from your testing framework.
   *
   * @param {Function} testable - A function to test or to end the test.  This function will be called with two parameters,
   * err and result. In other words, 'testable(err, result)'.
   * @returns {Promise} - Nothing gets resolved on a successful resolution of this promise chain. But you can use the promise to handle errors thrown from the 'test' function to ensure you do not allow false positives.
   */
  test(testable) {
    this._validateScenario_(testable);
    this._setTestable_(testable);
    this._setTestRunnable_();
    this._setPerfRunnable_();
    return Promise.resolve().then(() => this.accept(execute_test_default)).then(() => this.accept(wait_for_test_finisher_default)).then(() => this.accept(test_mocks_default)).then(() => this.accept(execute_perf_default)).then(() => this.accept(skip_test_default)).then(() => this.accept(finish_test_default)).catch((err) => this.accept(handle_error_default, err));
  }
};
var scenario_default = Scenario;

// lib/scenarios/http-req-scenario.js
var preconditions3 = Preconditions3.errr();
var HttpReqScenario = class extends scenario_default {
  constructor(testContext) {
    super(testContext);
    this._scenarioType_ = constants_default.scenarioTypes.HttpReqScenario;
    this.HttpResponseMock = {};
    this._finishedHasBeenSet_ = false;
  }
  // TODO: resDoesError / resDoesReturn
  /**
   * Provides same functionality as 'withInputParams' but it provides a lexical name that matches the HttpReqScenario.
   *
   * @param {Object} request - An object representing the structure of a Node HttpRequest. Most common things to add
   * are 'body', 'params', 'query', etc. But you can put anything you'd like into this object.
   * @returns {Scenario}
   */
  withHttpRequest(request) {
    preconditions3.shouldBeArray(request, error_factory_default.build(constants_default.errorMessages.HttpRequestArray)).debug({ request }).test();
    this._inputParams_ = request;
    return this;
  }
  /**
   * This function is synonymous with the 'shouldBeCalledWith' function except here we are mocking a function on the
   * HttpResponse object that is passed into the controller with the HttpRequest object. Common functions to mock here
   * send, json, statusCode, etc. You can test the parameters of any function execution on the response object.
   *
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @param {Object} params - An object representing an HttpRequest object.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalledWith(funcName, params) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ResShouldBeCalledWithFunctionString)).debug({ funcName }).test();
    preconditions3.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ResShouldBeCalledWithParamsArray)).debug({ params }).test();
    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalledWith(constants_default.ResponseMockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object that should be called with
   * the a superset of the expected parameters on a call to the Response Mock.
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters that are a subset of the actual parameters. First parameter
   * of the function goes in index 0 and the nth parameter of the function goes into index n.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalledWithSubset(funcName, params) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ funcName }).test();
    preconditions3.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ funcName, params }).test();
    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalledWithSubset(constants_default.ResponseMockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object. This
   * check does not validate any parameters, it just validates that the function is called.
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {HttpReqScenario}
   */
  resShouldBeCalled(funcName) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ funcName }).test();
    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalled(constants_default.ResponseMockName, funcName);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines a mocked function on the response object that should be called with
   * the same expected parameters on every call to the Response Mock
   *
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Array} params - An array of expected parameters. First parameter of the function goes in index 0 and the
   * nth parameter of the function goes into index n.
   * @returns {HttpReqScenario}
   */
  resShouldAlwaysBeCalledWith(funcName, params) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ funcName }).test();
    preconditions3.shouldBeArray(params, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithParamsArray)).debug({ funcName, params }).test();
    this._configureResponseMock_(funcName);
    this._mock_.shouldAlwaysBeCalledWith(constants_default.ResponseMockName, funcName, params);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' specifically designed for Http Headers. This function mocks the 'set' function
   * (or the provided function name) on the response mock. This function should be used to set a header in the response.
   *
   * In Express, you use the following syntax for for setting a header 'res.set("headerKey", "headerValue");'.
   *
   * @param {String} headerName - The name of the header. i.e. The key.
   * @param {String} headerValue - The value of the header.
   * @param {String} [funcName] - Defaults to Expresses .set function.
   * @returns {HttpReqScenario}
   */
  resShouldContainHeader(headerName, headerValue, funcName) {
    preconditions3.shouldBeString(headerName, error_factory_default.build(constants_default.errorMessages.HeaderNameShouldBeString)).debug({ headerName, headerValue }).test();
    preconditions3.shouldBeString(headerValue, error_factory_default.build(constants_default.errorMessages.HeaderValueShouldBeString)).debug({ headerName, headerValue }).test();
    funcName = funcName || "set";
    this._configureResponseMock_(funcName);
    this._mock_.shouldBeCalledWith(constants_default.ResponseMockName, funcName, [headerName, headerValue]);
    this.resDoesReturnSelf(funcName);
    return this;
  }
  /**
   * A variant of 'shouldBeCalledWith' that defines the parameters being passed into a given mocked function should never
   * be tested.
   *
   * I was hesitant to add this functionality as it can easily be abused. That being said, there are some valid use cases
   * but you should always think twice before using this function as you are essentially saying that you do not care
   * about testing this mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @returns {HttpReqScenario}
   */
  resShouldAlwaysBeIgnored(funcName) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.ShouldBeCalledWithFunctionString)).debug({ mockName: constants_default.ResponseMockName, funcName }).test();
    this._configureResponseMock_(funcName);
    this._mock_.shouldAlwaysBeIgnored(constants_default.ResponseMockName, funcName);
    return this;
  }
  /**
   * This function is synonymous with the 'doesReturn' function except here we are defining what is returned from a mocked
   * function on the HTTP Response object. i.e. Defines what to return during a success scenario from a **synchronous**
   * mocked function on the HTTP Response object.
   *
   * Ordering matters when defining the response from mocked functions. The first time your mock is called, Maddox will
   * return the response of the first defined response from 'doesReturn' or one of its variants.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesReturn(funcName, dataToReturn) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnFuncName)).debug({ mockName: constants_default.ResponseMockName, funcName }).test();
    this._mock_.doesReturn(constants_default.ResponseMockName, funcName, dataToReturn, mock_default.SynchronousType, false);
    return this;
  }
  /**
   * This is a variant of 'doesReturn'. Defines what to return during a success scenario from a **synchronous** mocked function
   * on the HTTP Response Object. The dataToReturn will be returned on every execution of the mock. That means you only
   * need to define one return value for all calls to the mock.
   *
   * @param {String} mockName - This is the key for the mock. It should match the key from 'mockThisFunction'.
   * @param {String} funcName - The name of the function to be mocked. Should match the name from 'mockThisFunction'.
   * @param {Any} dataToReturn - The data that will be returned when this mocked function is executed.
   * @returns {Scenario}
   */
  resDoesAlwaysReturn(funcName, dataToReturn) {
    preconditions3.shouldBeString(funcName, error_factory_default.build(constants_default.errorMessages.DoesReturnFuncName)).debug({ mockName: constants_default.ResponseMockName, funcName }).test();
    this._mock_.doesAlwaysReturn(constants_default.ResponseMockName, funcName, dataToReturn, mock_default.SynchronousType, false);
    return this;
  }
  /**
   * Some Http libraries in Node allow chainable functionality. For example, the following is a common express paradigm:
   * res.statusCode(200).send(result). To ensure Maddox allows a chainable interface like this, it allows the user to define
   * which functions should be chainable by using the 'resDoesReturnSelf'.  For the status code example, you would want
   * to add 'resDoesReturnSelf("statusCode")' to your scenario.
   * @param {String} funcName - The name of the function to be mocked on the HttpResponse object.
   * @returns {HttpReqScenario}
   */
  resDoesReturnSelf(funcName) {
    this._mock_.mockThisFunctionAtMostOnce(constants_default.ResponseMockName, funcName, this.HttpResponseMock);
    this._mock_.doesReturn(constants_default.ResponseMockName, funcName, this.HttpResponseMock, mock_default.SynchronousType, false);
    return this;
  }
  _configureResponseMock_(funcName) {
    this.HttpResponseMock[funcName] = this.HttpResponseMock[funcName] || function() {
    };
    this._mock_.mockThisFunctionAtMostOnce(constants_default.ResponseMockName, funcName, this.HttpResponseMock);
    if (constants_default.ResponseEndFunctions[funcName] && !this._finishedHasBeenSet_) {
      this._finishedHasBeenSet_ = true;
      this._mock_.setResponseEndFunction(constants_default.ResponseMockName, funcName);
    }
    if (constants_default.ResponseEndFunctions[funcName]) {
      this.resDoesReturnSelf(funcName);
    }
  }
  _setTestRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);
    this._testRunnable_ = () => {
      return new Promise((resolve) => {
        this._mock_.setCallbackForResponseEnd(resolve);
        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      });
    };
  }
  _setPerfRunnable_() {
    this._inputParams_.push(this.HttpResponseMock);
    this._perfRunnable_ = (sampleDone) => {
      this._mock_.setCallbackForResponseEnd(() => {
        sampleDone();
      });
      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    };
  }
  _validateScenario_(testable) {
    const inputParams = this._getInputParams_();
    const entryPointFunction = this._getEntryPointFunction_();
    const hasFinisherBeenSet = this._hasFinishedBeenSet_();
    preconditions3.shouldBeFunction(testable, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ testable }).test();
    preconditions3.shouldBeDefined(entryPointFunction, error_factory_default.build(constants_default.errorMessages.MissingEntryPoint)).debug({ entryPointFunction }).test();
    preconditions3.shouldBeDefined(inputParams, error_factory_default.build(constants_default.errorMessages.HttpReqUndefined)).debug({ inputParams }).test();
    preconditions3.checkArgument(hasFinisherBeenSet, error_factory_default.build(constants_default.errorMessages.ExactlyOneResponseFinisher)).debug({ responseFinishers: Object.keys(constants_default.ResponseEndFunctions) }).test();
  }
};
var http_req_scenario_default = HttpReqScenario;

// lib/scenarios/from-promise-scenario.js
import Preconditions4 from "preconditions";
var preconditions4 = Preconditions4.errr();
var FromPromiseScenario = class extends scenario_default {
  constructor(testContext) {
    super(testContext);
    this._scenarioType_ = constants_default.scenarioTypes.FromPromiseScenario;
  }
  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        const promise = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
        if (!promise || !promise.then) {
          const message = error_factory_default.build(constants_default.errorMessages.ResponseMustBePromise);
          const error = new Error(message);
          this._getMock_().setMaddoxRuntimeError(error);
          reject(error);
        } else {
          promise.then((result) => {
            resolve(result);
          }).catch((err) => {
            reject(err);
          });
        }
      });
    };
  }
  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_).then(() => {
        sampleDone();
      });
    };
  }
  _validateScenario_(testable) {
    const entryPointFunction = this._getEntryPointFunction_();
    preconditions4.shouldBeFunction(testable, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ testable }).test();
    preconditions4.shouldBeDefined(entryPointFunction, error_factory_default.build(constants_default.errorMessages.MissingEntryPoint)).debug({ entryPointFunction }).test();
  }
};
var from_promise_scenario_default = FromPromiseScenario;

// lib/scenarios/from-callback-scenario.js
import Preconditions5 from "preconditions";
var preconditions5 = Preconditions5.errr();
var FromCallbackScenario = class extends scenario_default {
  constructor(testContext) {
    super(testContext);
    this._scenarioType_ = constants_default.scenarioTypes.FromCallbackScenario;
  }
  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        this._inputParams_.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
        this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      });
    };
  }
  _setPerfRunnable_() {
    let alreadyAddedCallback = false;
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      const callback = () => {
        sampleDone();
      };
      if (!alreadyAddedCallback) {
        this._inputParams_.push(callback);
        alreadyAddedCallback = true;
      } else {
        this._inputParams_[this._inputParams_.length - 1] = callback;
      }
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
    };
  }
  _validateScenario_(testable) {
    const entryPointFunction = this._getEntryPointFunction_();
    preconditions5.shouldBeFunction(testable, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ testable }).test();
    preconditions5.shouldBeDefined(entryPointFunction, error_factory_default.build(constants_default.errorMessages.MissingEntryPoint)).debug({ entryPointFunction }).test();
  }
};
var from_callback_scenario_default = FromCallbackScenario;

// lib/scenarios/from-synchronous-scenario.js
import Preconditions6 from "preconditions";
var preconditions6 = Preconditions6.errr();
var FromSynchronousScenario = class extends scenario_default {
  constructor(testContext) {
    super(testContext);
    this._scenarioType_ = constants_default.scenarioTypes.FromSynchronousScenario;
  }
  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return new Promise((resolve, reject) => {
        const result = this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
        if (result instanceof Promise) {
          const message = error_factory_default.build(constants_default.errorMessages.ResponseCannotBePromise);
          const error = new Error(message);
          this._getMock_().setMaddoxRuntimeError(error);
          reject(error);
        } else {
          resolve(result);
        }
      });
    };
  }
  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      this._entryPointFunction_.apply(this._entryPointObject_, this._inputParams_);
      sampleDone();
    };
  }
  _validateScenario_(testable) {
    const entryPointFunction = this._getEntryPointFunction_();
    preconditions6.shouldBeFunction(testable, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ testable }).test();
    preconditions6.shouldBeDefined(entryPointFunction, error_factory_default.build(constants_default.errorMessages.MissingEntryPoint)).debug({ entryPointFunction }).test();
  }
};
var from_synchronous_scenario_default = FromSynchronousScenario;

// lib/scenarios/framework-route-scenario.js
import Preconditions7 from "preconditions";
var preconditions7 = Preconditions7.errr();
var FrameworkRouteScenario = class extends scenario_default {
  constructor(testContext) {
    super(testContext);
    this._scenarioType_ = constants_default.scenarioTypes.FrameworkRouteScenario;
    this._routeDescriptors_ = [];
    this._initialEntries_ = ["/"];
    this._stubAppContext_ = void 0;
    this._wrapperCallback_ = null;
    this._steps_ = [];
    this._renderCalled_ = false;
  }
  // Guardrail: configuration methods (anything that affects what render does) cannot be chained
  // after `.render()`. Surfaces a clear build error instead of silently no-op-ing.
  _assertConfigBeforeRender_(methodName) {
    preconditions7.checkArgument(
      this._renderCalled_ === false,
      error_factory_default.build(constants_default.errorMessages.FrameworkRouteConfigAfterRender)
    ).debug({ methodName }).test();
  }
  /**
   * Register one stub route for `createRoutesStub`. The route's real `loader` / `action`
   * (if present on `module`) run during the scenario unless you explicitly opt in to
   * mocking them by calling `mockThisFunction(mockName, 'loader', module)` /
   * `mockThisFunction(mockName, 'action', module)` yourself. Each `mockName` must be
   * unique across `addStub` calls (Maddox mock keys).
   *
   * @param {{ mockName: string, path: string, module: { default: unknown, loader?: Function, action?: Function }, id?: string, children?: unknown[] }} descriptor
   * @returns {FrameworkRouteScenario}
   */
  addStub(descriptor) {
    this._assertConfigBeforeRender_("addStub");
    preconditions7.shouldBeObject(descriptor, error_factory_default.build(constants_default.errorMessages.FrameworkRouteAddStubDescriptor)).debug({ descriptor }).test();
    const mockName = descriptor.mockName;
    const path = descriptor.path;
    const module = descriptor.module;
    preconditions7.shouldBeDefined(mockName, error_factory_default.build(constants_default.errorMessages.FrameworkRouteAddStubMockName)).debug({ descriptor }).test();
    preconditions7.shouldBeString(mockName, error_factory_default.build(constants_default.errorMessages.FrameworkRouteAddStubMockName)).debug({ descriptor }).test();
    preconditions7.shouldBeDefined(path, error_factory_default.build(constants_default.errorMessages.FrameworkRoutePathString)).debug({ descriptor }).test();
    preconditions7.shouldBeString(path, error_factory_default.build(constants_default.errorMessages.FrameworkRoutePathString)).debug({ descriptor }).test();
    preconditions7.shouldBeDefined(module, error_factory_default.build(constants_default.errorMessages.FrameworkRouteModuleObject)).debug({ descriptor }).test();
    preconditions7.shouldBeObject(module, error_factory_default.build(constants_default.errorMessages.FrameworkRouteModuleObject)).debug({ descriptor }).test();
    preconditions7.shouldBeDefined(module.default, error_factory_default.build(constants_default.errorMessages.FrameworkRouteModuleDefault)).debug({ descriptor }).test();
    this._routeDescriptors_.push({
      mockName,
      path,
      module,
      id: descriptor.id,
      children: descriptor.children
    });
    return this;
  }
  /**
   * @param {unknown[]} entries History entries for the stub (strings or location objects).
   * @returns {FrameworkRouteScenario}
   */
  withInitialEntries(entries) {
    this._assertConfigBeforeRender_("withInitialEntries");
    preconditions7.shouldBeArray(entries, error_factory_default.build(constants_default.errorMessages.FrameworkRouteInitialEntriesArray)).debug({ entries }).test();
    preconditions7.checkArgument(entries.length > 0, error_factory_default.build(constants_default.errorMessages.FrameworkRouteInitialEntriesArray)).debug({ entries }).test();
    this._initialEntries_ = entries;
    return this;
  }
  /**
   * Optional second argument to `createRoutesStub` (`AppLoadContext` / router context provider).
   * @param {unknown} context
   * @returns {FrameworkRouteScenario}
   */
  withStubAppContext(context) {
    this._assertConfigBeforeRender_("withStubAppContext");
    this._stubAppContext_ = context;
    return this;
  }
  /**
   * Wrap the framework-built `<Stub initialEntries={...} />` element in React context providers
   * (Theme, Redux, QueryClient, Auth, i18n, etc.) before Testing Library renders it.
   *
   * The callback receives `children` — the already-built React element for the `Stub` — and
   * must return a new React element that wraps `children`. In a JSX-enabled project:
   *
   *   .withWrapper((children) => <ThemeProvider>{children}</ThemeProvider>)
   *
   * In plain JS:
   *
   *   import { createElement } from 'react';
   *   .withWrapper((children) => createElement(ThemeProvider, null, children))
   *
   * @param {(children: object) => object} wrapperFn
   * @returns {FrameworkRouteScenario}
   */
  withWrapper(wrapperFn) {
    this._assertConfigBeforeRender_("withWrapper");
    preconditions7.shouldBeFunction(wrapperFn, error_factory_default.build(constants_default.errorMessages.FrameworkRouteWrapperCallback)).debug({ wrapperFn }).test();
    this._wrapperCallback_ = wrapperFn;
    return this;
  }
  /**
   * Explicit render boundary. Mark the position in the chain where the component mounts;
   * everything above is configuration, everything below acts on the rendered DOM.
   *
   * @returns {FrameworkRouteScenario}
   */
  render() {
    this._renderCalled_ = true;
    this._steps_.push({ kind: "render" });
    return this;
  }
  /**
   * Post-render interaction step. The callback receives Testing Library's `screen`, `waitFor`,
   * `render`, `cleanup`, and a `userEvent.setup()` instance. Must be chained AFTER `.render()`.
   *
   * @param {(ctx: { screen: object, waitFor: Function, render: Function, cleanup: Function, userEvent: object }) => void | Promise<void>} stepFn
   * @returns {FrameworkRouteScenario}
   */
  next(stepFn) {
    preconditions7.checkArgument(
      this._renderCalled_ === true,
      error_factory_default.build(constants_default.errorMessages.FrameworkRouteNextBeforeRender)
    ).test();
    preconditions7.shouldBeFunction(stepFn, error_factory_default.build(constants_default.errorMessages.FrameworkRouteNextStepFunction)).debug({ stepFn }).test();
    this._steps_.push({ kind: "next", fn: stepFn });
    return this;
  }
  // ---------------------------------------------------------------------------
  // Inherited Scenario mock-configuration methods.
  //
  // Each one is overridden purely to enforce the "before render" guardrail and then forward to
  // the base implementation. Behavior is otherwise unchanged.
  // ---------------------------------------------------------------------------
  mockThisFunction(mockName, funcName, object) {
    this._assertConfigBeforeRender_("mockThisFunction");
    return super.mockThisFunction(mockName, funcName, object);
  }
  withTestFinisherFunction(mockName, funcName, iteration) {
    this._assertConfigBeforeRender_("withTestFinisherFunction");
    return super.withTestFinisherFunction(mockName, funcName, iteration);
  }
  shouldBeCalledWith(mockName, funcName, params) {
    this._assertConfigBeforeRender_("shouldBeCalledWith");
    return super.shouldBeCalledWith(mockName, funcName, params);
  }
  shouldBeCalledWithSubset(mockName, funcName, params) {
    this._assertConfigBeforeRender_("shouldBeCalledWithSubset");
    return super.shouldBeCalledWithSubset(mockName, funcName, params);
  }
  shouldBeCalled(mockName, funcName) {
    this._assertConfigBeforeRender_("shouldBeCalled");
    return super.shouldBeCalled(mockName, funcName);
  }
  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    this._assertConfigBeforeRender_("shouldAlwaysBeCalledWith");
    return super.shouldAlwaysBeCalledWith(mockName, funcName, params);
  }
  shouldAlwaysBeCalledWithSubset(mockName, funcName, params) {
    this._assertConfigBeforeRender_("shouldAlwaysBeCalledWithSubset");
    return super.shouldAlwaysBeCalledWithSubset(mockName, funcName, params);
  }
  shouldAlwaysBeIgnored(mockName, funcName) {
    this._assertConfigBeforeRender_("shouldAlwaysBeIgnored");
    return super.shouldAlwaysBeIgnored(mockName, funcName);
  }
  doesReturn(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesReturn");
    return super.doesReturn(mockName, funcName, dataToReturn);
  }
  doesAlwaysReturn(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesAlwaysReturn");
    return super.doesAlwaysReturn(mockName, funcName, dataToReturn);
  }
  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesReturnWithPromise");
    return super.doesReturnWithPromise(mockName, funcName, dataToReturn);
  }
  doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesAlwaysReturnWithPromise");
    return super.doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn);
  }
  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesReturnWithCallback");
    return super.doesReturnWithCallback(mockName, funcName, dataToReturn);
  }
  doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesAlwaysReturnWithCallback");
    return super.doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn);
  }
  doesError(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesError");
    return super.doesError(mockName, funcName, dataToReturn);
  }
  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesErrorWithPromise");
    return super.doesErrorWithPromise(mockName, funcName, dataToReturn);
  }
  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_("doesErrorWithCallback");
    return super.doesErrorWithCallback(mockName, funcName, dataToReturn);
  }
  // ---------------------------------------------------------------------------
  // Execution
  // ---------------------------------------------------------------------------
  async _runStubTestBody_() {
    let rtlCleanup = null;
    const invocations = [];
    try {
      const [{ createRoutesStub }, rtl, react, userEventMod] = await Promise.all([
        import("react-router"),
        import("@testing-library/react"),
        import("react"),
        import("@testing-library/user-event")
      ]);
      const { render, screen, waitFor, cleanup } = rtl;
      const { createElement } = react;
      const userEvent = userEventMod.default;
      const routes = this._routeDescriptors_.map((d) => {
        const route = { path: d.path, Component: d.module.default };
        if (typeof d.module.loader === "function") {
          route.loader = this._wrapForCapture_(d.mockName, "loader", d.module.loader, invocations);
        }
        if (typeof d.module.action === "function") {
          route.action = this._wrapForCapture_(d.mockName, "action", d.module.action, invocations);
        }
        if (d.id) {
          route.id = d.id;
        }
        if (d.children) {
          route.children = d.children;
        }
        return route;
      });
      const Stub = createRoutesStub(routes, this._stubAppContext_);
      const ctx = {
        screen,
        waitFor,
        render,
        cleanup,
        userEvent: userEvent.setup()
      };
      for (const step of this._steps_) {
        if (step.kind === "render") {
          const stubEl = createElement(Stub, { initialEntries: this._initialEntries_ });
          let elementToRender = stubEl;
          if (typeof this._wrapperCallback_ === "function") {
            elementToRender = this._wrapperCallback_(stubEl);
            preconditions7.shouldBeDefined(
              elementToRender,
              error_factory_default.build(constants_default.errorMessages.FrameworkRouteWrapperReturn)
            ).debug({ elementToRender }).test();
          }
          render(elementToRender);
          rtlCleanup = cleanup;
        } else {
          await Promise.resolve(step.fn(ctx));
        }
      }
    } finally {
      if (typeof rtlCleanup === "function") {
        rtlCleanup();
      }
    }
    return invocations;
  }
  // Wraps a route's loader/action so each invocation is recorded in `invocations` in the order
  // it was called (capture-on-invoke), with `value` filled in once the wrapped function resolves.
  _wrapForCapture_(mockName, kind, originalFn, invocations) {
    return async function maddoxCaptureWrapper(...args) {
      const entry = { mockName, kind, value: void 0 };
      invocations.push(entry);
      const result = await originalFn.apply(this, args);
      entry.value = result;
      return result;
    };
  }
  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return this._runStubTestBody_().catch((err) => {
        this._getMock_().setMaddoxRuntimeError(err);
        return Promise.reject(err);
      });
    };
  }
  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      this._runStubTestBody_().then(
        () => {
          sampleDone();
        },
        () => {
          sampleDone();
        }
      );
    };
  }
  _validateScenario_(testable) {
    preconditions7.shouldBeFunction(testable, error_factory_default.build(constants_default.errorMessages.MissingTestCallback)).debug({ testable }).test();
    preconditions7.checkArgument(
      this._routeDescriptors_.length > 0,
      error_factory_default.build(constants_default.errorMessages.FrameworkRouteMissingRoutes)
    ).debug({ routeDescriptors: this._routeDescriptors_ }).test();
    preconditions7.checkArgument(
      this._renderCalled_ === true,
      error_factory_default.build(constants_default.errorMessages.FrameworkRouteMissingRender)
    ).test();
  }
};
var framework_route_scenario_default = FrameworkRouteScenario;

// lib/index.js
var index_default = {
  functional: {
    HttpReqScenario: http_req_scenario_default,
    FromPromiseScenario: from_promise_scenario_default,
    FromCallbackScenario: from_callback_scenario_default,
    FromSynchronousScenario: from_synchronous_scenario_default,
    FrameworkRouteScenario: framework_route_scenario_default,
    RemixScenario: framework_route_scenario_default
  },
  scenarios: {
    HttpReqScenario: http_req_scenario_default,
    FromPromiseScenario: from_promise_scenario_default,
    FromCallbackScenario: from_callback_scenario_default,
    FromSynchronousScenario: from_synchronous_scenario_default,
    FrameworkRouteScenario: framework_route_scenario_default,
    RemixScenario: framework_route_scenario_default
  },
  constants: {
    EmptyParameters: [],
    EmptyResult: {},
    IgnoreParam: constants_default.IgnoreParam
  },
  compare: mocha_proxy_default
};
export {
  index_default as default
};
