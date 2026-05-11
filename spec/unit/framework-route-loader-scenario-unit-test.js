import Maddox from '../../lib/index.js';
import random from '../random.js';
import StatelessEs6Proxy from '../testable/proxies/stateless-es6-proxy.js';
import * as Route from '../testable/modules/test-module/framework-route-home.js';

describe('Given the FrameworkRouteScenario running the real loader', function () {
  let testContext;

  describe('When the loader executes inside createRoutesStub with proxies mocked, it', function () {
    beforeEach(function () {
      testContext = {};

      testContext.setupTest = function () {
        testContext.proxyInstance = StatelessEs6Proxy;
      };

      testContext.setupUrl = function () {
        testContext.personId = '123456789';
        testContext.homeState = 'IL';
        testContext.initialEntries = [`/persons/${testContext.personId}?homeState=${testContext.homeState}`];
      };

      testContext.setupGetFirstName = function () {
        testContext.getFirstName1Params = [testContext.personId];
        testContext.getFirstName1Result = random.firstName();

        testContext.getFirstName2Params = [testContext.personId, testContext.getFirstName1Result];
        testContext.getFirstName2Result = random.firstName();
      };

      testContext.setupGetMiddleName = function () {
        testContext.getMiddleNameParams = [testContext.personId, testContext.getFirstName2Result];
        testContext.getMiddleNameResult = random.firstName();
      };

      testContext.setupGetLastName = function () {
        testContext.getLastNameParams = [
          testContext.personId,
          testContext.getFirstName2Result,
          testContext.getMiddleNameResult
        ];
        testContext.getLastNameResult = [undefined, random.lastName()];
      };

      testContext.setupExpected = function () {
        testContext.expectedLoaderValue = {
          personId: testContext.personId,
          homeState: testContext.homeState,
          lastName: testContext.getLastNameResult[1]
        };
      };
    });

    it('should run the real loader through createRoutesStub, drive it with mocked proxies, and surface the loader response', function (done) {
      testContext.setupTest();
      testContext.setupUrl();
      testContext.setupGetFirstName();
      testContext.setupGetMiddleName();
      testContext.setupGetLastName();
      testContext.setupExpected();

      new Maddox.scenarios.RemixScenario(this)
        .addStub({ mockName: 'HomeRoute', path: '/persons/:personId', module: Route })

        .mockThisFunction('proxyInstance', 'getFirstName', testContext.proxyInstance)
        .mockThisFunction('proxyInstance', 'getMiddleName', testContext.proxyInstance)
        .mockThisFunction('proxyInstance', 'getLastName', testContext.proxyInstance)

        .shouldBeCalledWith('proxyInstance', 'getFirstName', testContext.getFirstName1Params)
        .doesReturnWithPromise('proxyInstance', 'getFirstName', testContext.getFirstName1Result)

        .shouldBeCalledWith('proxyInstance', 'getFirstName', testContext.getFirstName2Params)
        .doesReturnWithPromise('proxyInstance', 'getFirstName', testContext.getFirstName2Result)

        .shouldBeCalledWith('proxyInstance', 'getMiddleName', testContext.getMiddleNameParams)
        .doesReturn('proxyInstance', 'getMiddleName', testContext.getMiddleNameResult)

        .shouldBeCalledWith('proxyInstance', 'getLastName', testContext.getLastNameParams)
        .doesReturnWithCallback('proxyInstance', 'getLastName', testContext.getLastNameResult)

        .withInitialEntries(testContext.initialEntries)

        .render()

        .next(async ({ screen, waitFor }) => {
          await waitFor(async () => {
            await screen.findByText(`LastName: ${testContext.expectedLoaderValue.lastName}`);
          });
        })

        .test(function (err, response) {
          try {
            Maddox.compare.shouldEqual({ actual: err, expected: undefined });
            Maddox.compare.shouldEqual({
              actual: response,
              expected: [
                { mockName: 'HomeRoute', kind: 'loader', value: testContext.expectedLoaderValue }
              ]
            });
            done();
          } catch (testError) {
            done(testError);
          }
        })
        .catch((e) => done(e));
    });
  });
});
