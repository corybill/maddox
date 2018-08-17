"use strict";

const chai = require("chai");
const Errr = require("errr");
const util = require("util");
const Preconditions = require("preconditions");

const constants = require("../constants");

const preconditions = Preconditions.errr();

const expect = chai.expect;

class Private {
  static shouldEqual(left, right, message) {
    try {
      expect(left, message).eql(right);
    } catch (err) {
      throw util.isError(left) ? Errr.fromError(left).appendTo(err).throw() : err;
    }
  }

  static shouldBeTruthy(value, message) {
    expect(value, message).to.be.ok; // eslint-disable-line
  }

  static shouldBeFalsey(value, message) {
    expect(value, message).to.be.not.ok; // eslint-disable-line
  }

  static getContext(context) {
    context = context || {noDebug: false};
    context.noDebug = !!context.noDebug;
    return context;
  }
}

class Mocha {

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
    context = Private.getContext(context);

    try {
      Private.shouldEqual(actual, expected, message);
    } catch (err) {
      let throwable = (context.noDebug === true) ?
        Errr.newError(err.message).appendTo(err).get() :
        Errr.newError(err.message).debug({actual, expected}).appendTo(err).get();

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
    context = Private.getContext(context);

    try {
      Private.shouldBeTruthy(value, message);
    } catch (err) {
      let throwable = (context.noDebug === true) ?
        Errr.newError(err.message).appendTo(err).get() :
        Errr.newError(err.message).debug({actual: value, expected: "Some Truthy Value."}).appendTo(err).get();

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
    context = Private.getContext(context);

    try {
      Private.shouldBeFalsey(value, message);
    } catch (err) {
      let throwable = (context.noDebug === true) ?
        Errr.newError(err.message).appendTo(err).get() :
        Errr.newError(err.message).debug({actual: value, expected: "Some Falsey Value."}).appendTo(err).get();

      throw throwable;
    }
  }

  /**
   * Does a fuzzy match between the two objects. This means that it will loop through all the keys at the top level of the
   * 'expected' object and do a deep equals check between actual[key] and expected[key]. If everything in the expected object
   * exists and exactly matches what is in the acutal object, then the comparison will pass. If the actual object has extra
   * key / values that are not in the expected object, this will NOT cause the test to fail.
   *
   * @param {Object} actual - The actual value for comparison.
   * @param {Object} expected - The expected value for fuzzy comparison.
   * @param {String} [message] - The message added to the Errr if the comparison fails.
   * @param {Object} [context] - Holds different configuration options.
   * @param {Boolean} [context.noDebug] - If set to true, Maddox will not append debug info in the stacktrace. Defaults
   * to false.
   * @returns nothing
   */
  static fuzzyEqualObject(actual, expected, message, context) {
    preconditions.shouldBeObject(expected, constants.errorMessages.IllegalFuzzyObjectEqual.message).test();
    preconditions.shouldBeObject(actual, constants.errorMessages.IllegalFuzzyObjectEqual.message).test();
    context = Private.getContext(context);

    for (let expectedKey in expected) {
      if (expected.hasOwnProperty(expectedKey)) {
        let actualValue = actual[expectedKey];
        let expectedValue = expected[expectedKey];

        try {
          Private.shouldEqual(actualValue, expectedValue, message);
        } catch (err) {
          let throwable = (context.noDebug === true) ?
            Errr.newError(err.message).appendTo(err).get() :
            Errr.newError(err.message).debug({actual: actualValue, expected: expectedValue, keyThatFailed: expectedKey}).appendTo(err).get();

          throw throwable;
        }
      }
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
    Mocha.equal(context.actual, context.expected, context.message, context);
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
    Mocha.truthy(context.value, context.message, context);
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
    Mocha.falsey(context.value, context.message, context);
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
    Mocha.falsey(context.value, context.message, context);
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

    Mocha.shouldEqual({expected: true, actual: false, message, noDebug: true});
  }

  static shouldFuzzyEqualObject(context) {
    Mocha.fuzzyEqualObject(context.actual, context.expected, context.message, context);
  }
}

module.exports = Mocha;
