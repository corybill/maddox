
const chai = require('chai');
const Errr = require('errr');
const util = require('util');
const isSubset = require('is-subset');
const CoreUtilIs = require('core-util-is');

const constants = require('../constants');

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
    context = context || { noDebug: false };
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
        Errr.newError(err.message).debug({ actual, expected }).appendTo(err).get();

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
        Errr.newError(err.message).debug({ actual: value, expected: 'Some Truthy Value.' }).appendTo(err).get();

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
        Errr.newError(err.message).debug({ actual: value, expected: 'Some Falsey Value.' }).appendTo(err).get();

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
    message = message || constants.errorMessages.FailedSubsetCheck.message;
    context = Private.getContext(context);

    const isPassing = (CoreUtilIs.isString(actual) && CoreUtilIs.isString(expected) && actual.indexOf(expected) !== -1) ||
      isSubset(actual, expected);

    if (!isPassing) {
      let throwable = (context.noDebug === true) ?
        Errr.newError(message).get() :
        Errr.newError(message).debug({ actual, expected }).get();

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
    message = message || 'It should be impossible to reach this code.';

    Mocha.shouldEqual({ expected: true, actual: false, message, noDebug: true });
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
    Mocha.subset(context.actual, context.expected, context.message, context);
  }
}

module.exports = Mocha;
