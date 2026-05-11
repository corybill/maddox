import { createElement } from 'react';
import { useLoaderData } from 'react-router';
import Maddox from '../../lib/index.js';

const Scenario = Maddox.functional.FrameworkRouteScenario;

function MessageView() {
  const data = useLoaderData();
  return createElement('p', { 'data-testid': 'msg' }, `Message: ${data.message}`);
}

describe('Given FrameworkRouteScenario (React Router v7 createRoutesStub)', function () {
  it('exposes RemixScenario as an alias of FrameworkRouteScenario', function () {
    Maddox.compare.equal(Maddox.functional.RemixScenario, Maddox.functional.FrameworkRouteScenario);
  });

  it('should run a loader through Maddox mocks, render stub data, and assert UI', function (done) {
    const homeRoute = {
      default: MessageView,
      loader() {
        return { message: 'hello' };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .shouldBeCalledWithSubset('HomeRoute', 'loader', [{ params: {} }])
      .doesReturnWithPromise('HomeRoute', 'loader', { message: 'hello' })
      .withInitialEntries(['/'])
      .render((Stub, h) => h(Stub, { initialEntries: ['/'] }))
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('Message: hello');
        });
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        done();
      })
      .catch((e) => done(e));
  });

  it('should default render when render() is not given a callback', function (done) {
    const homeRoute = {
      default: MessageView,
      loader() {
        return { message: 'hi' };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .shouldBeCalledWithSubset('HomeRoute', 'loader', [{ params: {} }])
      .doesReturnWithPromise('HomeRoute', 'loader', { message: 'hi' })
      .withInitialEntries(['/'])
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('Message: hi');
        });
      })
      .test((err) => {
        Maddox.compare.equal(err, undefined);
        done();
      })
      .catch((e) => done(e));
  });

  it('should fail when shouldBeCalledWith does not match the loader argument', function (done) {
    const homeRoute = {
      default: MessageView,
      loader() {
        return { message: 'hello' };
      }
    };

    new Scenario(this)
      .addStub({ mockName: 'HomeRoute', path: '/', module: homeRoute })
      .shouldBeCalledWith('HomeRoute', 'loader', [{ params: { noSuchParam: 'x' } }])
      .doesReturnWithPromise('HomeRoute', 'loader', { message: 'hello' })
      .withInitialEntries(['/'])
      .render((Stub, h) => h(Stub, { initialEntries: ['/'] }))
      .next(async ({ screen, waitFor }) => {
        await waitFor(async () => {
          await screen.findByText('Message: hello');
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
});
