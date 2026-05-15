import { createElement } from 'react';
import Maddox from '../../lib/index.js';
import PersonView, { loader as homeRouteLoader } from '../testable/modules/test-module/framework-route-home.js';

const Scenario = Maddox.functional.FrameworkRouteScenario;

const homeRoute = {
  default: PersonView,
  loader: homeRouteLoader
};

describe('Given FrameworkRouteScenario (React Router v7 createRoutesStub)', function () {
  it('exposes RemixScenario as an alias of FrameworkRouteScenario', function () {
    Maddox.compare.equal(Maddox.functional.RemixScenario, Maddox.functional.FrameworkRouteScenario);
  });

  it('should run a mocked loader (opt-in via mockThisFunction), render stub data, and surface the captured response', function (done) {
    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .mockThisFunction('HomeRoute', 'loader', homeRoute)
      .shouldBeCalledWithSubset('HomeRoute', 'loader', [{ params: {} }])
      .doesReturnWithPromise('HomeRoute', 'loader', { lastName: 'Hopper' })
      .render()
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('LastName: Hopper');
        });
      })
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.shouldEqual({
          actual: response,
          expected: [{ mockName: 'HomeRoute', kind: 'loader', value: { lastName: 'Hopper' } }]
        });
        done();
      })
      .catch((e) => done(e));
  });

  it('should default-render with the default initialEntries when neither is configured', function (done) {
    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .mockThisFunction('HomeRoute', 'loader', homeRoute)
      .shouldBeCalledWithSubset('HomeRoute', 'loader', [{ params: {} }])
      .doesReturnWithPromise('HomeRoute', 'loader', { lastName: 'Lovelace' })
      .render()
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('LastName: Lovelace');
        });
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        done();
      })
      .catch((e) => done(e));
  });

  it('should fail when shouldBeCalledWith does not match the loader argument', function (done) {
    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .mockThisFunction('HomeRoute', 'loader', homeRoute)
      .shouldBeCalledWith('HomeRoute', 'loader', [{ params: { noSuchParam: 'x' } }])
      .doesReturnWithPromise('HomeRoute', 'loader', { lastName: 'Hopper' })
      .render()
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('LastName: Hopper');
        });
      })
      .test(() => {
        done(new Error('expected mock validation to throw before testable'));
      })
      .catch((e) => {
        Maddox.compare.truthy(e);
        done();
      });
  });

  it('should run the real loader (no mock) and capture its response in the invocations array', function (done) {
    const realRoute = {
      default: PersonView,
      loader: async ({ request }) => {
        const url = new URL(request.url);
        const lastName = url.searchParams.get('lastName');

        return { lastName };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: realRoute })
      .withInitialEntries(['/?lastName=Turing'])
      .render()
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('LastName: Turing');
        });
      })
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.shouldEqual({
          actual: response,
          expected: [{ mockName: 'HomeRoute', kind: 'loader', value: { lastName: 'Turing' } }]
        });
        done();
      })
      .catch((e) => done(e));
  });

  describe('HydrateFallback', function () {
    const CUSTOM_HYDRATE_TEST_ID = 'maddox-custom-hydrate-fallback';

    function CustomHydrateFallback() {
      return createElement('span', { 'data-testid': CUSTOM_HYDRATE_TEST_ID }, 'hydrating');
    }

    function slowLoader() {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ lastName: 'Slow' }), 75);
      });
    }

    it('should apply the default HydrateFallback when none is provided on the stub', function (done) {
      const slowRoute = {
        default: PersonView,
        loader: slowLoader
      };

      new Scenario(this)
        .addStub({ mockName: 'HomeRoute', path: '/', module: slowRoute })
        .render()
        .next(async ({ screen, waitFor }) => {
          Maddox.compare.equal(screen.queryByTestId(CUSTOM_HYDRATE_TEST_ID), null);
          await waitFor(async () => {
            await screen.findByText('LastName: Slow');
          });
        })
        .test((err) => {
          Maddox.compare.equal(err, undefined);
          done();
        })
        .catch((e) => done(e));
    });

    it('should use a custom HydrateFallback from the stub descriptor instead of the default', function (done) {
      const slowRoute = {
        default: PersonView,
        loader: slowLoader
      };

      new Scenario(this)
        .addStub({
          mockName: 'HomeRoute',
          path: '/',
          module: slowRoute,
          HydrateFallback: CustomHydrateFallback
        })
        .render()
        .next(async ({ screen, waitFor }) => {
          await waitFor(() => {
            Maddox.compare.truthy(screen.getByTestId(CUSTOM_HYDRATE_TEST_ID));
          });
          await waitFor(async () => {
            await screen.findByText('LastName: Slow');
          });
        })
        .test((err) => {
          Maddox.compare.equal(err, undefined);
          done();
        })
        .catch((e) => done(e));
    });

    it('should use HydrateFallback from the route module when the descriptor does not set one', function (done) {
      const slowRoute = {
        default: PersonView,
        loader: slowLoader,
        HydrateFallback: CustomHydrateFallback
      };

      new Scenario(this)
        .addStub({ mockName: 'HomeRoute', path: '/', module: slowRoute })
        .render()
        .next(async ({ screen, waitFor }) => {
          await waitFor(() => {
            Maddox.compare.truthy(screen.getByTestId(CUSTOM_HYDRATE_TEST_ID));
          });
          await waitFor(async () => {
            await screen.findByText('LastName: Slow');
          });
        })
        .test((err) => {
          Maddox.compare.equal(err, undefined);
          done();
        })
        .catch((e) => done(e));
    });

    it('should prefer HydrateFallback on the descriptor over the route module', function (done) {
      function OtherHydrateFallback() {
        return createElement('span', { 'data-testid': 'maddox-other-hydrate-fallback' }, 'other');
      }

      const slowRoute = {
        default: PersonView,
        loader: slowLoader,
        HydrateFallback: OtherHydrateFallback
      };

      new Scenario(this)
        .addStub({
          mockName: 'HomeRoute',
          path: '/',
          module: slowRoute,
          HydrateFallback: CustomHydrateFallback
        })
        .render()
        .next(async ({ screen, waitFor }) => {
          await waitFor(() => {
            Maddox.compare.truthy(screen.getByTestId(CUSTOM_HYDRATE_TEST_ID));
          });
          Maddox.compare.equal(screen.queryByTestId('maddox-other-hydrate-fallback'), null);
          await waitFor(async () => {
            await screen.findByText('LastName: Slow');
          });
        })
        .test((err) => {
          Maddox.compare.equal(err, undefined);
          done();
        })
        .catch((e) => done(e));
    });
  });

  it('should wrap the Stub element with withWrapper before rendering', function (done) {
    const calls = { wrapperInvoked: 0, providerRendered: 0 };

    function TestProvider({ children }) {
      calls.providerRendered = calls.providerRendered + 1;
      return children;
    }

    const realRoute = {
      default: PersonView,
      loader: async () => ({ lastName: 'Wrapped' })
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: realRoute })
      .withWrapper((children) => {
        calls.wrapperInvoked = calls.wrapperInvoked + 1;
        return createElement(TestProvider, null, children);
      })
      .render()
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('LastName: Wrapped');
        });
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.equal(calls.wrapperInvoked, 1);
        Maddox.compare.truthy(calls.providerRendered >= 1);
        done();
      })
      .catch((e) => done(e));
  });

  describe('build-time guardrails', function () {
    it('should throw a build error when .next is chained before .render', function () {
      let buildError;

      try {
        new Scenario(this)
          .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
          .next(async () => {});
      } catch (err) {
        buildError = err;
      }

      Maddox.compare.truthy(buildError);
      Maddox.compare.truthy(buildError.message.indexOf('.next(...)') !== -1);
      Maddox.compare.truthy(buildError.message.indexOf('.render()') !== -1);
    });

    it('should throw a build error from .test when .render was never chained', function () {
      let buildError;

      try {
        new Scenario(this)
          .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
          .test(() => {});
      } catch (err) {
        buildError = err;
      }

      Maddox.compare.truthy(buildError);
      Maddox.compare.truthy(buildError.message.indexOf("'.render()'") !== -1);
    });

    it('should throw a build error when a configuration method is chained after .render', function () {
      let buildError;

      try {
        new Scenario(this)
          .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
          .render()
          .mockThisFunction('HomeRoute', 'loader', homeRoute);
      } catch (err) {
        buildError = err;
      }

      Maddox.compare.truthy(buildError);
      Maddox.compare.truthy(buildError.message.indexOf('after') !== -1);
      Maddox.compare.truthy(buildError.message.indexOf('.render()') !== -1);
    });

    it('should throw a build error when addStub is chained after .render', function () {
      let buildError;

      try {
        new Scenario(this)
          .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
          .render()
          .addStub({ mockName: 'OtherRoute', path: '/other', module: homeRoute });
      } catch (err) {
        buildError = err;
      }

      Maddox.compare.truthy(buildError);
      Maddox.compare.truthy(buildError.message.indexOf('after') !== -1);
      Maddox.compare.truthy(buildError.message.indexOf('.render()') !== -1);
    });

    it('should throw a build error when withInitialEntries is chained after .render', function () {
      let buildError;

      try {
        new Scenario(this)
          .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
          .render()
          .withInitialEntries(['/somewhere-else']);
      } catch (err) {
        buildError = err;
      }

      Maddox.compare.truthy(buildError);
      Maddox.compare.truthy(buildError.message.indexOf('after') !== -1);
      Maddox.compare.truthy(buildError.message.indexOf('.render()') !== -1);
    });
  });
});
