"use strict";

const chai = require("chai");

const Maddox = require("../../lib/index");
const random = require("../random");

const expect = chai.expect;

describe("Given the comparison module", function () {
  describe("When statically comparing two items using", function () {
    let testContext;

    describe("equal, it", function () {
      beforeEach(function () {
        testContext = {};

        testContext.setupValues = function () {
          testContext.field1 = random.uniqueId();
          testContext.field2 = random.uniqueId();
          testContext.field3 = random.uniqueId();
          testContext.field4 = random.uniqueId();
          testContext.message = random.uniqueId();
        };
        testContext.setupLhs = function () {
          testContext.lhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field3, testContext.field4]
          };
        };
        testContext.setupRhs = function () {
          testContext.rhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field3, testContext.field4]
          };
        };
        testContext.setupExpected = function () {
          testContext.expectedResponse = `${testContext.message}: expected { Object (field1, field2, ...) } to deeply equal { Object (field1, field2, ...) }`;
        };
      });

      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.equal(true, false, undefined, {noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: false
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.equal(true, false, undefined, {noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: false
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should throw when the items DO NOT equal", function (done) {
        testContext.setupRhs = function () {
          testContext.rhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field4, testContext.field3]
          };
        };

        testContext.setupValues();
        testContext.setupLhs();
        testContext.setupRhs();
        testContext.setupExpected();

        try {
          Maddox.compare.equal(testContext.lhs, testContext.rhs);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          try {
            expect(err.message).to.be.ok; // eslint-disable-line
            done();
          } catch (mochaErr) {
            done(mochaErr);
          }
        }
      });

      it("should pass when the items DO equal", function () {
        testContext.setupValues();
        testContext.setupLhs();
        testContext.setupRhs();
        testContext.setupExpected();

        try {
          Maddox.compare.equal(testContext.lhs, testContext.rhs);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });
    });

    describe("shouldBeEqual, it", function () {
      beforeEach(function () {
        testContext = {};

        testContext.setupValues = function () {
          testContext.field1 = random.uniqueId();
          testContext.field2 = random.uniqueId();
          testContext.field3 = random.uniqueId();
          testContext.field4 = random.uniqueId();
          testContext.message = random.uniqueId();
        };
        testContext.setupLhs = function () {
          testContext.lhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field3, testContext.field4]
          };
        };
        testContext.setupRhs = function () {
          testContext.rhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field3, testContext.field4]
          };
        };
        testContext.setupExpected = function () {
          testContext.expectedResponse = `${testContext.message}: expected { Object (field1, field2, ...) } to deeply equal { Object (field1, field2, ...) }`;
        };
      });

      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.shouldEqual({actual: true, expected: false, noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: false
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.shouldEqual({actual: true, expected: false, noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: false
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should throw when the items DO NOT equal", function (done) {
        testContext.setupRhs = function () {
          testContext.rhs = {
            field1: testContext.field2,
            field2: testContext.field2,
            array1: [testContext.field4, testContext.field3]
          };
        };

        testContext.setupValues();
        testContext.setupLhs();
        testContext.setupRhs();
        testContext.setupExpected();

        try {
          Maddox.compare.shouldEqual({actual: testContext.lhs, expected: testContext.rhs});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          try {
            expect(err.message).to.be.ok; // eslint-disable-line
            done();
          } catch (mochaErr) {
            done(mochaErr);
          }
        }
      });

      it("should pass when the items DO equal", function () {
        testContext.setupValues();
        testContext.setupLhs();
        testContext.setupRhs();
        testContext.setupExpected();

        try {
          Maddox.compare.shouldEqual({actual: testContext.lhs, expected: testContext.rhs});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });
    });

    describe("truthy, it", function () {

      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.truthy(false, undefined, {noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: false,
            expected: "Some Truthy Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.truthy(false, undefined, {noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: false,
            expected: "Some Truthy Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should pass when shouldBeTruthy comparison is given true value.", function () {
        try {
          Maddox.compare.truthy(true);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass when shouldBeTruthy comparison is given a defined value.", function () {
        try {
          Maddox.compare.truthy("SomeDefinedValue");
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should throw when shouldBeTruthy comparison is given a false value.", function () {
        try {
          Maddox.compare.truthy(false);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok; // eslint-disable-line
        }
      });

      it("should throw when shouldBeTruthy comparison is given an undefined value.", function () {
        try {
          Maddox.compare.truthy(undefined);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok; // eslint-disable-line
        }
      });
    });

    describe("falsey, it", function () {
      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.falsey(true, undefined, {noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.falsey(true, undefined, {noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should pass when shouldBeFalsy comparison is given false value.", function () {
        try {
          Maddox.compare.falsey(false);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass when shouldBeFalsy comparison is given an undefined value.", function () {
        try {
          Maddox.compare.falsey(undefined);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should throw when shouldBeFalsy comparison is given a true value.", function () {
        try {
          Maddox.compare.falsey(true);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });

      it("should throw when shouldBeFalsy comparison is given a defined value.", function () {
        try {
          Maddox.compare.falsey("SomeDefinedValue");
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });
    });

    describe("shouldBeTruthy, it", function () {
      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: false, noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: false,
            expected: "Some Truthy Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: false, noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: false,
            expected: "Some Truthy Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should pass when shouldBeTruthy comparison is given true value.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: true});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass when shouldBeTruthy comparison is given a defined value.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: "SomeDefinedValue"});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should throw when shouldBeTruthy comparison is given a false value.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });

      it("should throw when shouldBeTruthy comparison is given an undefined value.", function () {
        try {
          Maddox.compare.shouldBeTruthy({value: undefined});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });
    });

    describe("shouldBeFalsey, it", function () {
      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: true, noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: true, noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should pass when shouldBeFalsy comparison is given false value.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: false});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass when shouldBeFalsy comparison is given an undefined value.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: undefined});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should throw when shouldBeFalsy comparison is given a true value.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });

      it("should throw when shouldBeFalsy comparison is given a defined value.", function () {
        try {
          Maddox.compare.shouldBeFalsey({value: "SomeDefinedValue"});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });
    });

    describe("shouldBeFalsy, it", function () {

      it("should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: true, noDebug: false});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(2);
        }
      });

      it("should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: true, noDebug: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          const debugParams = {
            actual: true,
            expected: "Some Falsey Value."
          };

          const expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);

          expect(err.stack.split(expectedResponse).length).eql(1);
        }
      });

      it("should pass when shouldBeFalsy comparison is given false value.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: false});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass when shouldBeFalsy comparison is given an undefined value.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: undefined});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should throw when shouldBeFalsy comparison is given a true value.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: true});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });

      it("should throw when shouldBeFalsy comparison is given a defined value.", function () {
        try {
          Maddox.compare.shouldBeFalsy({value: "SomeDefinedValue"});
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          expect(err).to.be.ok // eslint-disable-line
        }
      });
    });

    describe("shouldBeUnreachable, it", function () {
      it("should throw when using Maddox's shouldBeUnreachable function", function () {
        try {
          Maddox.compare.shouldBeUnreachable();
          expect("shouldBeUnreachable should throw an error making it impossible to reach this code").eql(undefined);
        } catch (err) {
          expect(err.message).eql("It should be impossible to reach this code.: expected false to deeply equal true");
        }
      });

      it("should throw when using Maddox's shouldBeUnreachable function with the provided message.", function () {
        const message = random.uniqueId();

        try {
          Maddox.compare.shouldBeUnreachable(message);
          expect("shouldBeUnreachable should throw an error making it impossible to reach this code").eql(undefined);
        } catch (err) {
          expect(err.message).eql(`${message}: expected false to deeply equal true`);
        }
      });
    });

    describe.only("fuzzyEqualObject, it", () => {
      it("should pass fuzzy match when given to empty objects.", () => {
        const actual = {};
        const expected = {};

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable();
        }
      });

      it("should pass fuzzy match when expected object is a subset of actual object.", () => {
        const randomId1 = random.uniqueId();
        const randomId2 = random.uniqueId();

        const actual = {one: {foo1: randomId1}, two: {foo2: randomId2}};
        const expected = {two: {foo2: randomId2}};

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable(err.stack);
        }
      });

      it("should pass fuzzy match when using the context version.", () => {
        const randomId1 = random.uniqueId();
        const randomId2 = random.uniqueId();

        const actual = {one: {foo1: randomId1}, two: {foo2: randomId2}};
        const expected = {two: {foo2: randomId2}};

        try {
          Maddox.compare.shouldFuzzyEqualObject({actual, expected});
          expect("I should be here.").to.be.ok; // eslint-disable-line
        } catch (err) {
          Maddox.compare.shouldBeUnreachable(err.stack);
        }
      });

      it("should fail fuzzy match when expected object has a value that does not exist in actual.", () => {
        const randomId1 = random.uniqueId();
        const randomId2 = random.uniqueId();

        const actual = {one: {foo1: randomId1}, two: {foo2: randomId2}};
        const expected = {two: {foo2: randomId2}, three: {foo2: randomId2}};

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          Maddox.compare.truthy(err.stack.indexOf("actual") !== -1, "Should have actual in debug params");
          Maddox.compare.truthy(err.stack.indexOf("expected") !== -1, "Should have expected in debug params");
          Maddox.compare.truthy(err.stack.indexOf("keyThatFailed") !== -1, "Should have keyThatFailed in debug params");
        }
      });

      it("should fail fuzzy match when expected object has a value that does not match the value in actual.", () => {
        const randomId1 = random.uniqueId();
        const randomId2 = random.uniqueId();

        const actual = {one: {foo1: randomId1}, two: {foo2: randomId2}};
        const expected = {one: {foo1: randomId1}, two: {foo2: randomId1}};

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          Maddox.compare.truthy(err.stack.indexOf("actual") !== -1, "Should have actual in debug params");
          Maddox.compare.truthy(err.stack.indexOf("expected") !== -1, "Should have expected in debug params");
          Maddox.compare.truthy(err.stack.indexOf("keyThatFailed") !== -1, "Should have keyThatFailed in debug params");
        }
      });

      it("should fail fuzzy match when the actual value is not an object.", () => {
        const actual = "SOME NON OBJECT";
        const expected = {foo: "foo"};

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          Maddox.compare.equal(err.message, "When fuzzy comparing two objects, you the first two arguments must be of object.");
        }
      });

      it("should fail fuzzy match when the expected value is not an object.", () => {
        const actual = {foo: "foo"};
        const expected = "SOME NON OBJECT";

        try {
          Maddox.compare.fuzzyEqualObject(actual, expected);
          Maddox.compare.shouldBeUnreachable();
        } catch (err) {
          Maddox.compare.equal(err.message, "When fuzzy comparing two objects, you the first two arguments must be of object.");
        }
      });
    });
  });
});
