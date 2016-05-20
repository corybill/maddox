"use strict";

const Maddox = require("../../lib/index"),
  chai = require("chai"),
  random = require("../random");

const Scenario = Maddox.functional.FromSynchronousScenario,
  expect = chai.expect;

describe("When statically comparing two items", function () {
  let testContext;

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
    testContext.setupTest = function () {
      testContext.inputParams = {
        actual: testContext.lhs,
        expected: testContext.rhs,
        message: testContext.message
      };
      testContext.entryPointObject = {
        run: function () {
          Maddox.compare.shouldEqual(testContext.inputParams);
        }
      };
      testContext.entryPointFunction = "run";
    };
    testContext.setupExpected = function () {
      testContext.expectedResponse = `${testContext.message}: expected { Object (field1, field2, ...) } to deeply equal { Object (field1, field2, ...) }`;
    };
  });

  it("it should add the full object print out of actual and expected when the noDebug flag is NOT set.", function (done) {
    testContext.setupRhs = function () {
      testContext.rhs = {
        field1: testContext.field2,
        field2: testContext.field2,
        array1: [testContext.field4, testContext.field3]
      };
    };
    testContext.setupExpected = function () {
      let debugParams = {
        actual: testContext.lhs,
        expected: testContext.rhs
      };

      testContext.expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);
    };

    testContext.setupValues();
    testContext.setupLhs();
    testContext.setupRhs();
    testContext.setupTest();
    testContext.setupExpected();

    new Scenario()
      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(Maddox.constants.EmptyParameters)

      .test(function (err, response) {
        try {
          expect(err.stack.split(testContext.expectedResponse).length).eql(2);
          expect(response).eql(undefined);
          done();
        } catch (mochaErr) {
          done(mochaErr);
        }
      });
  });

  it("it should NOT add the full object print out of actual and expected when the noDebug flag IS set.", function (done) {
    testContext.setupRhs = function () {
      testContext.rhs = {
        field1: testContext.field2,
        field2: testContext.field2,
        array1: [testContext.field4, testContext.field3]
      };
    };
    testContext.setupTest = function () {
      testContext.inputParams = {
        actual: testContext.lhs,
        expected: testContext.rhs,
        message: testContext.message,
        noDebug: true
      };
      testContext.entryPointObject = {
        run: function () {
          Maddox.compare.shouldEqual(testContext.inputParams);
        }
      };
      testContext.entryPointFunction = "run";
    };
    testContext.setupExpected = function () {
      let debugParams = {
        actual: testContext.lhs,
        expected: testContext.rhs
      };

      testContext.expectedResponse = "Debug Params: " + JSON.stringify(debugParams, null, 2);
    };

    testContext.setupValues();
    testContext.setupLhs();
    testContext.setupRhs();
    testContext.setupTest();
    testContext.setupExpected();

    new Scenario()
      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(Maddox.constants.EmptyParameters)

      .test(function (err, response) {
        try {
          expect(err.stack.split(testContext.expectedResponse).length).eql(1);
          expect(response).eql(undefined);
          done();
        } catch (mochaErr) {
          done(mochaErr);
        }
      });
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
    testContext.setupTest();
    testContext.setupExpected();

    new Scenario()
      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(Maddox.constants.EmptyParameters)

      .test(function (err, response) {
        try {
          expect(err.message).eql(testContext.expectedResponse);
          expect(response).eql(undefined);
          done();
        } catch (mochaErr) {
          done(mochaErr);
        }
      });
  });

  it("it should pass when the items DO equal", function (done) {
    testContext.setupValues();
    testContext.setupLhs();
    testContext.setupRhs();
    testContext.setupTest();
    testContext.setupExpected();

    new Scenario()
      .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
      .withInputParams(Maddox.constants.EmptyParameters)

      .test(function (err, response) {
        try {
          expect(err).eql(undefined);
          expect(response).eql(undefined);
          done();
        } catch (mochaErr) {
          done(mochaErr);
        }
      });
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
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected false to be truthy"});
    }
  });

  it("it should throw when shouldBeTruthy comparison is given an undefined value.", function () {
    try {
      Maddox.compare.shouldBeTruthy({value: undefined});
      Maddox.compare.shouldBeUnreachable();
    } catch (err) {
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected undefined to be truthy"});
    }
  });

  it("it should pass when shouldBeFalsey comparison is given false value.", function () {
    try {
      Maddox.compare.shouldBeFalsey({value: false});
      expect("I should be here.").to.be.ok; // eslint-disable-line
    } catch (err) {
      Maddox.compare.shouldBeUnreachable();
    }
  });

  it("it should pass when shouldBeFalsey comparison is given an undefined value.", function () {
    try {
      Maddox.compare.shouldBeFalsey({value: undefined});
      expect("I should be here.").to.be.ok; // eslint-disable-line
    } catch (err) {
      Maddox.compare.shouldBeUnreachable();
    }
  });

  it("it should throw when shouldBeFalsey comparison is given a true value.", function () {
    try {
      Maddox.compare.shouldBeFalsey({value: true});
      Maddox.compare.shouldBeUnreachable();
    } catch (err) {
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected true to be falsy"});
    }
  });

  it("it should throw when shouldBeFalsey comparison is given a defined value.", function () {
    try {
      Maddox.compare.shouldBeFalsey({value: "SomeDefinedValue"});
      Maddox.compare.shouldBeUnreachable();
    } catch (err) {
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected 'SomeDefinedValue' to be falsy"});
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
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected true to be falsy"});
    }
  });

  it("it should throw when shouldBeFalsy comparison is given a defined value.", function () {
    try {
      Maddox.compare.shouldBeFalsy({value: "SomeDefinedValue"});
      Maddox.compare.shouldBeUnreachable();
    } catch (err) {
      Maddox.compare.shouldEqual({actual: err.message, expected: "expected 'SomeDefinedValue' to be falsy"});
    }
  });

  it("it should throw when using Maddox's shouldBeUnreachable function", function () {
    try {
      Maddox.compare.shouldBeUnreachable();
      expect("shouldBeUnreachable should throw an error making it impossible to reach this code").eql(undefined);
    } catch (err) {
      expect(err.message).eql("It should be impossible to reach this code.: expected false to deeply equal true");
    }
  });
});
