import Preconditions from 'preconditions';
import Scenario from './scenario.js';
import ErrorFactory from '../plugins/error-factory.js';
import constants from '../constants.js';

const preconditions = Preconditions.errr();

/**
 * React Router v7 framework-style unit tests using `createRoutesStub`, rendered via Testing Library,
 * inside Maddox's mock verification pipeline.
 *
 * Peer packages (install in the consuming project): `react`, `react-dom`, `react-router`,
 * `@testing-library/react`, `@testing-library/user-event`. They are loaded dynamically when the
 * test runs so importing Maddox does not require them until this scenario executes.
 *
 * Use **`addStub`** to register each route: Maddox automatically calls `mockThisFunction(mockName, 'loader', module)`
 * and `mockThisFunction(mockName, 'action', module)` when those functions exist on `module`, then passes the same
 * `module` into `createRoutesStub`. Chain `shouldBeCalledWith` / `doesReturnWithPromise` (and other Scenario mock
 * APIs) using `mockName` and `'loader'` or `'action'`. Loader and action receive a single framework args object;
 * express expected args as Maddox arrays (e.g. `[expectedArg]`).
 *
 * Limitations match React Router's testing docs: `createRoutesStub` is aimed at hook-driven components;
 * production server middleware and full route-tree `matches` are not guaranteed to match a live app.
 *
 * @see https://reactrouter.com/start/framework/testing
 */
class FrameworkRouteScenario extends Scenario {
  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.FrameworkRouteScenario;
    this._routeDescriptors_ = [];
    this._initialEntries_ = ['/'];
    this._nextSteps_ = [];
    this._stubAppContext_ = undefined;
    this._renderCallback_ = null;
  }

  /**
   * Register one stub route for `createRoutesStub` and auto-mock `loader` / `action` on `module` when present.
   * Each `mockName` must be unique across `addStub` calls (Maddox mock keys).
   *
   * @param {{ mockName: string, path: string, module: { default: unknown, loader?: Function, action?: Function }, id?: string, children?: unknown[] }} descriptor
   * @returns {FrameworkRouteScenario}
   */
  addStub(descriptor) {
    preconditions
      .shouldBeObject(descriptor, ErrorFactory.build(constants.errorMessages.FrameworkRouteAddStubDescriptor))
      .debug({ descriptor })
      .test();

    const mockName = descriptor.mockName;
    const path = descriptor.path;
    const module = descriptor.module;

    preconditions
      .shouldBeDefined(mockName, ErrorFactory.build(constants.errorMessages.FrameworkRouteAddStubMockName))
      .debug({ descriptor })
      .test();
    preconditions
      .shouldBeString(mockName, ErrorFactory.build(constants.errorMessages.FrameworkRouteAddStubMockName))
      .debug({ descriptor })
      .test();

    preconditions
      .shouldBeDefined(path, ErrorFactory.build(constants.errorMessages.FrameworkRoutePathString))
      .debug({ descriptor })
      .test();
    preconditions
      .shouldBeString(path, ErrorFactory.build(constants.errorMessages.FrameworkRoutePathString))
      .debug({ descriptor })
      .test();

    preconditions
      .shouldBeDefined(module, ErrorFactory.build(constants.errorMessages.FrameworkRouteModuleObject))
      .debug({ descriptor })
      .test();
    preconditions
      .shouldBeObject(module, ErrorFactory.build(constants.errorMessages.FrameworkRouteModuleObject))
      .debug({ descriptor })
      .test();
    preconditions
      .shouldBeDefined(module.default, ErrorFactory.build(constants.errorMessages.FrameworkRouteModuleDefault))
      .debug({ descriptor })
      .test();

    if (typeof module.loader === 'function') {
      this.mockThisFunction(mockName, 'loader', module);
    }
    if (typeof module.action === 'function') {
      this.mockThisFunction(mockName, 'action', module);
    }

    this._routeDescriptors_.push({
      path,
      module,
      id: descriptor.id,
      children: descriptor.children
    });

    return this;
  }

  /**
   * @param {unknown[]} entries History entries for the stub (strings or location objects).
   * @returns {FrameworkRouteScenario}
   */
  withInitialEntries(entries) {
    preconditions
      .shouldBeArray(entries, ErrorFactory.build(constants.errorMessages.FrameworkRouteInitialEntriesArray))
      .debug({ entries })
      .test();
    preconditions
      .checkArgument(entries.length > 0, ErrorFactory.build(constants.errorMessages.FrameworkRouteInitialEntriesArray))
      .debug({ entries })
      .test();

    this._initialEntries_ = entries;
    return this;
  }

  /**
   * Optional second argument to `createRoutesStub` (`AppLoadContext` / router context provider).
   * @param {unknown} context
   * @returns {FrameworkRouteScenario}
   */
  withStubAppContext(context) {
    this._stubAppContext_ = context;
    return this;
  }

  /**
   * @param {(ctx: { screen: object, waitFor: Function, render: Function, cleanup: Function, userEvent: object }) => void | Promise<void>} stepFn
   * @returns {FrameworkRouteScenario}
   */
  next(stepFn) {
    preconditions
      .shouldBeFunction(stepFn, ErrorFactory.build(constants.errorMessages.FrameworkRouteNextStepFunction))
      .debug({ stepFn })
      .test();

    this._nextSteps_.push(stepFn);
    return this;
  }

  /**
   * Controls what Testing Library `render` receives.
   *
   * - `render()` — reset to the default: `createElement(Stub, { initialEntries })` using `withInitialEntries`.
   * - `render((Stub, createElement) => element)` — your function receives the stub component from `createRoutesStub`
   *   and React's `createElement`; return a React element (in JSX tests: `return <Stub initialEntries={["/login"]} />`).
   *   Maddox passes that return value to `@testing-library/react`'s `render`.
   *
   * @param {(stub: object, createElement: Function) => object} [renderFn]
   * @returns {FrameworkRouteScenario}
   */
  render(renderFn) {
    if (renderFn === undefined) {
      this._renderCallback_ = null;
      return this;
    }

    preconditions
      .shouldBeFunction(renderFn, ErrorFactory.build(constants.errorMessages.FrameworkRouteRenderCallback))
      .debug({ renderFn })
      .test();

    this._renderCallback_ = renderFn;
    return this;
  }

  async _runStubTestBody_() {
    let rtlCleanup = null;

    try {
      const [{ createRoutesStub }, rtl, react, userEventMod] = await Promise.all([
        import('react-router'),
        import('@testing-library/react'),
        import('react'),
        import('@testing-library/user-event')
      ]);

      const { render, screen, waitFor, cleanup } = rtl;
      const { createElement } = react;
      const userEvent = userEventMod.default;

      const routes = this._routeDescriptors_.map((d) => {
        const route = { path: d.path, Component: d.module.default };

        if (typeof d.module.loader === 'function') {
          route.loader = d.module.loader;
        }
        if (typeof d.module.action === 'function') {
          route.action = d.module.action;
        }
        if (d.id) {
          route.id = d.id;
        }
        if (d.children) {
          route.children = d.children;
        }

        return route;
      });

      const Stub = createRoutesStub(routes, this._stubAppContext_);

      let stubEl;
      if (typeof this._renderCallback_ === 'function') {
        stubEl = this._renderCallback_(Stub, createElement);
      } else {
        stubEl = createElement(Stub, {
          initialEntries: this._initialEntries_
        });
      }

      preconditions
        .shouldBeDefined(stubEl, ErrorFactory.build(constants.errorMessages.FrameworkRouteRenderReturn))
        .debug({ stubEl })
        .test();

      render(stubEl);
      rtlCleanup = cleanup;

      const ctx = {
        screen,
        waitFor,
        render,
        cleanup,
        userEvent: userEvent.setup()
      };

      for (const step of this._nextSteps_) {
        await Promise.resolve(step(ctx));
      }
    } finally {
      if (typeof rtlCleanup === 'function') {
        rtlCleanup();
      }
    }
  }

  _setTestRunnable_() {
    this._testRunnable_ = () => {
      return this._runStubTestBody_().catch((err) => {
        this._getMock_().setMaddoxRuntimeError(err);

        return Promise.reject(err);
      });
    };
  }

  _setPerfRunnable_() {
    this._perfRunnable_ = (sampleDone) => {
      this._resetScenario_();
      this._runStubTestBody_().then(
        () => {
          sampleDone();
        },
        () => {
          sampleDone();
        }
      );
    };
  }

  _validateScenario_(testable) {
    preconditions
      .shouldBeFunction(testable, ErrorFactory.build(constants.errorMessages.MissingTestCallback))
      .debug({ testable })
      .test();

    preconditions
      .checkArgument(this._routeDescriptors_.length > 0, ErrorFactory.build(constants.errorMessages.FrameworkRouteMissingRoutes))
      .debug({ routeDescriptors: this._routeDescriptors_ })
      .test();
  }
}

export default FrameworkRouteScenario;
