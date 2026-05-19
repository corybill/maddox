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

  it('should correctly extract path parameters in the loader', function (done) {
    const realRoute = {
      default: function PersonDetail() {
        const { id } = Maddox.functional.FrameworkRouteScenario.useParams(); // We might need to expose useParams or just assume user uses real react-router
        // Actually, the component should just use useParams from react-router.
        // But since we are in a unit test, we'll just check if the loader got it.
        return createElement('div', null, 'Person Detail');
      },
      loader: async ({ params }) => {
        return { personId: params.personId };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'DetailRoute', path: '/persons/:personId', module: realRoute })
      .withInitialEntries(['/persons/123'])
      .render()
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.shouldEqual({
          actual: response,
          expected: [{ mockName: 'DetailRoute', kind: 'loader', value: { personId: '123' } }]
        });
        done();
      })
      .catch((e) => done(e));
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

  it('should handle URLSearchParams in Request body via the global patch (compatibility fix)', function (done) {
    const searchParams = new URLSearchParams();
    searchParams.set('firstName', 'Grace');

    const realRoute = {
      default: PersonView,
      loader: async ({ request }) => {
        // In a real Remix/React Router environment, useFetcher or form submissions
        // might pass URLSearchParams as the body to the Request constructor.
        // This test verifies that our patch allows this without throwing.
        const body = await request.text();
        const contentType = request.headers.get('Content-Type');
        return { body, contentType };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: realRoute })
      .render()
      // We simulate the problematic behavior by manually creating a Request with URLSearchParams
      // This is what React Router's createRoutesStub or useFetcher might do internally.
      .next(async () => {
        const req = new Request('http://localhost/', {
          method: 'POST',
          body: searchParams
        });

        const body = await req.text();
        const contentType = req.headers.get('Content-Type');

        Maddox.compare.equal(body, 'firstName=Grace');
        Maddox.compare.equal(contentType, 'application/x-www-form-urlencoded;charset=UTF-8');
      })
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        // The loader itself wasn't triggered by the manual Request above,
        // but it would have been if we triggered a real form submission.
        // This test primarily verifies the global Request patch is active during .next()
        done();
      })
      .catch((e) => done(e));
  });

  it('should capture action invocations and form data on submission', function (done) {
    import('react-router').then(({ useSubmit, useActionData }) => {
      const actionRoute = {
        default: function Contact() {
          const submit = useSubmit();
          const actionData = useActionData();
          return createElement('div', null,
            createElement('button', {
              onClick: () => {
                const formData = new FormData();
                formData.set('email', 'grace@example.com');
                submit(formData, { method: 'post' });
              }
            }, 'Submit'),
            actionData && actionData.saved && createElement('div', null, `Saved: ${actionData.saved}`)
          );
        },
        action: async ({ request }) => {
          const formData = await request.formData();
          return { saved: formData.get('email') };
        }
      };

      new Scenario(this)
        .addStub({ mockName: 'ContactRoute', path: '/contact', module: actionRoute })
        .withInitialEntries(['/contact'])
        .render()
        .next(async ({ screen, userEvent, waitFor }) => {
          const button = await screen.findByText('Submit');
          await userEvent.click(button);
          await waitFor(() => screen.getByText('Saved: grace@example.com'));
        })
        .test((err, response) => {
          Maddox.compare.equal(err, undefined);
          const actionEntry = response.find(r => r.kind === 'action');
          Maddox.compare.truthy(actionEntry);
          Maddox.compare.equal(actionEntry.value.saved, 'grace@example.com');
          done();
        })
        .catch((e) => done(e));
    }).catch(done);
  });

  it('should restore global.Request after the scenario completes', function (done) {
    const OriginalRequest = global.Request;

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .render()
      .next(async () => {
        Maddox.compare.truthy(global.Request !== OriginalRequest);
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.equal(global.Request, OriginalRequest);
        done();
      })
      .catch((e) => done(e));
  });

  it('should support nested routes via the children property', function (done) {
    import('react-router').then(({ Outlet }) => {
      const parentRoute = {
        default: function Layout() {
          return createElement('div', null,
            createElement('h1', null, 'Parent'),
            createElement(Outlet)
          );
        },
        loader: async () => ({ parentData: 'fromParent' })
      };

      const childRoute = {
        default: function Child() {
          return createElement('div', null, 'Child Content');
        },
        loader: async () => ({ childData: 'fromChild' })
      };

      new Scenario(this)
        .addStub({
          mockName: 'ParentRoute',
          path: '/parent',
          module: parentRoute,
          children: [
            { mockName: 'ChildRoute', path: 'child', Component: childRoute.default, loader: childRoute.loader }
          ]
        })
        .withInitialEntries(['/parent/child'])
        .render()
        .next(async ({ screen }) => {
          await screen.findByText('Parent');
          await screen.findByText('Child Content');
        })
        .test((err, response) => {
          Maddox.compare.equal(err, undefined);
          Maddox.compare.truthy(response.some(r => r.mockName === 'ParentRoute' && r.value.parentData === 'fromParent'));
          Maddox.compare.truthy(response.some(r => r.mockName === 'ChildRoute' && r.value.childData === 'fromChild'));
          done();
        })
        .catch((e) => done(e));
    }).catch(done);
  });

  it('should render the ErrorBoundary when a loader throws', function (done) {
    const errorRoute = {
      default: function Broken() { return createElement('div', null, 'Broken'); },
      loader: async () => { throw new Error('Loader Failed'); },
      ErrorBoundary: function MyErrorBoundary() {
        return createElement('div', null, 'Caught Error');
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'ErrorRoute', path: '/error', module: errorRoute })
      .withInitialEntries(['/error'])
      .render()
      .next(async ({ screen }) => {
        await screen.findByText('Caught Error');
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        done();
      })
      .catch((e) => done(e));
  });

  it('should handle redirects from loaders', function (done) {
    import('react-router').then(({ redirect }) => {
      const redirectRoute = {
        default: function Redirected() { return createElement('div', null, 'Redirected'); },
        loader: async () => { return redirect('/target'); }
      };

      const targetRoute = {
        default: function Target() { return createElement('div', null, 'Target Page'); },
        loader: async () => ({ arrived: true })
      };

      new Scenario(this)
        .addStub({ mockName: 'RedirectRoute', path: '/redirect', module: redirectRoute })
        .addStub({ mockName: 'TargetRoute', path: '/target', module: targetRoute })
        .withInitialEntries(['/redirect'])
        .render()
        .next(async ({ screen }) => {
          await screen.findByText('Target Page');
        })
        .test((err, response) => {
          Maddox.compare.equal(err, undefined);
          Maddox.compare.truthy(response.some(r => r.mockName === 'TargetRoute' && r.value.arrived === true));
          done();
        })
        .catch((e) => done(e));
    }).catch(done);
  });

  it('should support programmatic and link-based navigation', function (done) {
    import('react-router').then(({ Link }) => {
      const startRoute = {
        default: function Start() {
          return createElement('div', null,
            createElement('h1', null, 'Start Page'),
            createElement(Link, { to: '/end' }, 'Go to End')
          );
        },
        loader: async () => ({ step: 'start' })
      };

      const endRoute = {
        default: function End() { return createElement('div', null, 'End Page'); },
        loader: async () => ({ step: 'end' })
      };

      new Scenario(this)
        .addStub({ mockName: 'StartRoute', path: '/start', module: startRoute })
        .addStub({ mockName: 'EndRoute', path: '/end', module: endRoute })
        .withInitialEntries(['/start'])
        .render()
        .next(async ({ screen, userEvent }) => {
          const link = await screen.findByText('Go to End');
          await userEvent.click(link);
          await screen.findByText('End Page');
        })
        .test((err, response) => {
          Maddox.compare.equal(err, undefined);
          Maddox.compare.truthy(response.some(r => r.mockName === 'StartRoute' && r.value.step === 'start'));
          Maddox.compare.truthy(response.some(r => r.mockName === 'EndRoute' && r.value.step === 'end'));
          done();
        })
        .catch((e) => done(e));
    }).catch(done);
  });

  it('should pass AppLoadContext to loaders via withStubAppContext', function (done) {
    const contextRoute = {
      default: function ContextView() { return createElement('div', null, 'Context View'); },
      loader: async ({ context }) => {
        return { contextValue: context.myKey };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'ContextRoute', path: '/context', module: contextRoute })
      .withStubAppContext({ myKey: 'myValue' })
      .withInitialEntries(['/context'])
      .render()
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.truthy(response.some(r => r.mockName === 'ContextRoute' && r.value.contextValue === 'myValue'));
        done();
      })
      .catch((e) => done(e));
  });

  it('should revalidate loaders after an action completes', function (done) {
    import('react-router').then(({ useSubmit, useLoaderData }) => {
      let loaderCalls = 0;
      const revalidateRoute = {
        default: function RevalidateView() {
          const { count } = useLoaderData();
          const submit = useSubmit();
          return createElement('div', null,
            createElement('div', null, `Count: ${count}`),
            createElement('button', {
              onClick: () => submit(null, { method: 'post' })
            }, 'Mutate')
          );
        },
        loader: async () => {
          loaderCalls = loaderCalls + 1;
          return { count: loaderCalls };
        },
        action: async () => {
          return { success: true };
        }
      };

      new Scenario(this)
        .addStub({ mockName: 'RevalidateRoute', path: '/revalidate', module: revalidateRoute })
        .withInitialEntries(['/revalidate'])
        .render()
        .next(async ({ screen, userEvent, waitFor }) => {
          const button = await screen.findByText('Mutate');
          await userEvent.click(button);
          await waitFor(() => screen.getByText('Count: 2'));
        })
        .test((err, response) => {
          Maddox.compare.equal(err, undefined);
          // Initial loader call + revalidation after action = 2 calls
          const loaderEntries = response.filter(r => r.kind === 'loader' && r.mockName === 'RevalidateRoute');
          Maddox.compare.equal(loaderEntries.length, 2);
          Maddox.compare.equal(loaderEntries[0].value.count, 1);
          Maddox.compare.equal(loaderEntries[1].value.count, 2);
          done();
        })
        .catch((e) => done(e));
    }).catch(done);
  });

  it('should allow transforming the request via withRequestMiddleware', function (done) {
    const transformRoute = {
      default: function TransformView() { return createElement('div', null, 'Transform View'); },
      loader: async ({ request }) => {
        return { user: request.user };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'TransformRoute', path: '/transform', module: transformRoute })
      .withRequestMiddleware(async (request) => {
        // Simulate middleware adding a user to the request
        request.user = { name: 'Grace' };
        return request;
      })
      .withInitialEntries(['/transform'])
      .render()
      .test((err, response) => {
        Maddox.compare.equal(err, undefined);
        Maddox.compare.truthy(response.some(r => r.mockName === 'TransformRoute' && r.value.user.name === 'Grace'));
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
