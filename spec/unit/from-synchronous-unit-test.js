
const Maddox = require('../../lib/index'), // require("maddox");
  random = require('../random'),
  Controller = require('../testable/modules/test-module/from-synchronous-controller'),
  testConstants = require('../test-constants'),
  StatelessEs6Proxy = require('../testable/proxies/stateless-es6-proxy');

const uuid = require('uuid');

const Scenario = Maddox.functional.FromSynchronousScenario;

describe('Given the FromSynchronousScenario', function () {
  let testContext;

  describe('When using the FromSynchronousScenario, it', function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.entryPointObject = Controller;
        testContext.entryPointFunction = 'statelessEs6Proxy';
        testContext.proxyInstance = StatelessEs6Proxy;
      };

      testContext.setupInputParams = function () {
        testContext.params = {
          personId: '123456789'
        };
        testContext.query = {
          homeState: 'IL'
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

    it('should handle a successful request.', function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction('uuid', 'v4', uuid)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith('uuid', 'v4', Maddox.constants.EmptyParameters)
        .doesReturn('uuid', 'v4', testContext.getFirstNameResult)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName1Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName1Result)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName2Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName2Result)

        .perf()
        .test(function (err, response) {
          try {
            Maddox.compare.shouldEqual({ actual: err, expected: undefined });
            Maddox.compare.shouldEqual({ actual: response, expected: testContext.expectedResponse });
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it('should not test mocks or call testable function when maddox throws a error.', function (done) {
      testContext.setupExpected = () => {
        testContext.expectedResponse = 'Maddox Runtime Error (3001): Attempted to get mocked data for the second call to proxyInstance.getMiddleName, but it wasn\'t created in the scenario.  You are missing a \'doesReturn / doesError\' call.';
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction('uuid', 'v4', uuid)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith('uuid', 'v4', Maddox.constants.EmptyParameters)
        .doesReturn('uuid', 'v4', testContext.getFirstNameResult)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName1Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName1Result)

        .test(function () {
          done(new Error('Should not reach here'));
        }).catch((err) => {
          try {
            Maddox.compare.shouldEqual({ actual: err.message, expected: testContext.expectedResponse });
            done();
          } catch (testErr) {
            done(testErr);
          }
        });
    });

    it('should handle a checked exception.', function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {};
        testContext.query = {
          homeState: 'IL'
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupExpected = function () {
        testContext.expectedResponse = testConstants.MissingPersonIdParam;
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction('uuid', 'v4', uuid)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .test(function (err, response) {
          try {
            Maddox.compare.shouldEqual({ actual: err.message, expected: testContext.expectedResponse });
            Maddox.compare.shouldEqual({ actual: response, expected: undefined });
            done();
          } catch (testError) {
            done(testError);
          }
        });
    });

    it('should attach the exception from service (if it exists) when a mock test fails.', function (done) {
      testContext.setupInputParams = function () {
        testContext.params = {
          personId: testConstants.ForceTestFailure
        };
        testContext.query = {
          homeState: 'IL'
        };

        testContext.inputParams = [testContext.params, testContext.query];
      };

      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction('uuid', 'v4', uuid)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)

        .shouldBeCalledWith('uuid', 'v4', Maddox.constants.EmptyParameters)
        .doesReturn('uuid', 'v4', testContext.getFirstNameResult)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName1Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName1Result)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName2Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName2Result)

        .test(function () {
          done(new Error('Should not reach here'));
        }).catch((err) => {
          try {
            Maddox.compare.truthy(err.stack.indexOf(testConstants.ForceTestFailure) >= 0, 'Should have the message of the error thrown from the service.');
            done();
          } catch (testErr) {
            done(testErr);
          }
        });
    });

    it('should not test mocks that come after finisher function.', function (done) {
      testContext.setupTest();
      testContext.setupInputParams();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupExpected();

      new Scenario(this)
        .mockThisFunction('uuid', 'v4', uuid)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)

        .withEntryPoint(testContext.entryPointObject, testContext.entryPointFunction)
        .withInputParams(testContext.inputParams)
        .withTestFinisherFunction('proxyInstance', 'getMiddleName', 0)

        .shouldBeCalledWith('uuid', 'v4', Maddox.constants.EmptyParameters)
        .doesReturn('uuid', 'v4', testContext.getFirstNameResult)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleName1Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName1Result)

        // Don't need a shouldBeCalledWith because it never gets called
        // .shouldBeCalledWith("proxyInstance", "getMiddleName", testContext.getMiddleName2Params)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleName2Result)

        .test(function (err, response) {
          try {
            Maddox.compare.shouldEqual({ actual: err, expected: undefined });
            Maddox.compare.shouldEqual({ actual: response, expected: testContext.expectedResponse });
            done();
          } catch (testError) {
            done(testError);
          }
        });

    });

  });

});
