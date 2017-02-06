"use strict";

const Maddox = require("../../lib/index"),
  chai = require("chai"),
  random = require("../random");

const expect = chai.expect;

describe("When statically comparing two items using", function () {
  let testContext;

  describe("equal", () => {
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

    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should throw when the items DO NOT equal", function (done) {
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

    it("it should pass when the items DO equal", function () {
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

  describe("shouldBeEqual", () => {
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

    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should throw when the items DO NOT equal", function (done) {
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

    it("it should pass when the items DO equal", function () {
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

  describe("truthy", () => {

    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should pass when shouldBeTruthy comparison is given true value.", function () {
      try {
        Maddox.compare.truthy(true);
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should pass when shouldBeTruthy comparison is given a defined value.", function () {
      try {
        Maddox.compare.truthy("SomeDefinedValue");
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should throw when shouldBeTruthy comparison is given a false value.", function () {
      try {
        Maddox.compare.truthy(false);
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok; // eslint-disable-line
      }
    });

    it("it should throw when shouldBeTruthy comparison is given an undefined value.", function () {
      try {
        Maddox.compare.truthy(undefined);
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok; // eslint-disable-line
      }
    });
  });

  describe("falsey", () => {
    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should pass when shouldBeFalsy comparison is given false value.", function () {
      try {
        Maddox.compare.falsey(false);
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should pass when shouldBeFalsy comparison is given an undefined value.", function () {
      try {
        Maddox.compare.falsey(undefined);
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a true value.", function () {
      try {
        Maddox.compare.falsey(true);
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a defined value.", function () {
      try {
        Maddox.compare.falsey("SomeDefinedValue");
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });
  });

  describe("shouldBeTruthy", () => {
    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should pass when shouldBeTruthy comparison is given true value.", function () {
      try {
        Maddox.compare.shouldBeTruthy({value: true});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should pass when shouldBeTruthy comparison is given a defined value.", function () {
      try {
        Maddox.compare.shouldBeTruthy({value: "SomeDefinedValue"});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should throw when shouldBeTruthy comparison is given a false value.", function () {
      try {
        Maddox.compare.shouldBeTruthy({value: false});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });

    it("it should throw when shouldBeTruthy comparison is given an undefined value.", function () {
      try {
        Maddox.compare.shouldBeTruthy({value: undefined});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });
  });

  describe("shouldBeFalsey", () => {
    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should pass when shouldBeFalsy comparison is given false value.", function () {
      try {
        Maddox.compare.shouldBeFalsey({value: false});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should pass when shouldBeFalsy comparison is given an undefined value.", function () {
      try {
        Maddox.compare.shouldBeFalsey({value: undefined});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a true value.", function () {
      try {
        Maddox.compare.shouldBeFalsey({value: true});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a defined value.", function () {
      try {
        Maddox.compare.shouldBeFalsey({value: "SomeDefinedValue"});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });
  });

  describe("shouldBeFalsy", () => {

    it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function () {
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

    it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function () {
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

    it("it should pass when shouldBeFalsy comparison is given false value.", function () {
      try {
        Maddox.compare.shouldBeFalsy({value: false});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should pass when shouldBeFalsy comparison is given an undefined value.", function () {
      try {
        Maddox.compare.shouldBeFalsy({value: undefined});
        expect("I should be here.").to.be.ok; // eslint-disable-line
      } catch (err) {
        Maddox.compare.shouldBeUnreachable();
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a true value.", function () {
      try {
        Maddox.compare.shouldBeFalsy({value: true});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });

    it("it should throw when shouldBeFalsy comparison is given a defined value.", function () {
      try {
        Maddox.compare.shouldBeFalsy({value: "SomeDefinedValue"});
        Maddox.compare.shouldBeUnreachable();
      } catch (err) {
        expect(err).to.be.ok // eslint-disable-line
      }
    });
  });

  describe("shouldBeUnreachable", () => {
    it("it should throw when using Maddox's shouldBeUnreachable function", function () {
      try {
        Maddox.compare.shouldBeUnreachable();
        expect("shouldBeUnreachable should throw an error making it impossible to reach this code").eql(undefined);
      } catch (err) {
        expect(err.message).eql("It should be impossible to reach this code.: expected false to deeply equal true");
      }
    });

    it("it should throw when using Maddox's shouldBeUnreachable function with the provided message.", function () {
      const message = random.uniqueId();

      try {
        Maddox.compare.shouldBeUnreachable(message);
        expect("shouldBeUnreachable should throw an error making it impossible to reach this code").eql(undefined);
      } catch (err) {
        expect(err.message).eql(`${message}: expected false to deeply equal true`);
      }
    });
  });
});
