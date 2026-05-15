import Preconditions from 'preconditions';
import Scenario from './scenario.js';
import ErrorFactory from '../plugins/error-factory.js';
import constants from '../constants.js';

const preconditions = Preconditions.errr();

/** Renders nothing while a route loader runs; satisfies React Router v7's HydrateFallback requirement in tests. */
function maddoxDefaultHydrateFallback() {
  return null;
}

/**
 * React Router v7 framework-style unit tests using `createRoutesStub`, rendered via Testing Library,
 * inside Maddox's mock verification pipeline.
 *
 * Peer packages (install in the consuming project): `react`, `react-dom`, `react-router`,
 * `@testing-library/react`, `@testing-library/user-event`. They are loaded dynamically when the
 * test runs so importing Maddox does not require them until this scenario executes.
 *
 * Chain shape (order matters):
 *
 *   new FrameworkRouteScenario(this)
 *     // -- configuration (any order, all must come BEFORE .render()) --
 *     .addStub({ mockName: 'Home', path: '/persons/:personId', module: Home })
 *     .mockThisFunction('proxyInstance', 'getFirstName', proxy)
 *     .shouldBeCalledWith('proxyInstance', 'getFirstName', [personId])
 *     .doesReturnWithPromise('proxyInstance', 'getFirstName', 'Ada')
 *     .withInitialEntries(['/persons/123?homeState=IL'])
 *     .withWrapper((children) => h(ThemeProvider, null, children))   // optional
 *
 *     // -- timeline boundary --
 *     .render()                                                       // REQUIRED, exactly the moment the Stub mounts
 *
 *     // -- post-render interactions (zero or more, run after render) --
 *     .next(async ({ screen, waitFor }) => { ... })
 *
 *     .test((err, response) => { ... });
 *
 * `.render()` is the explicit timeline boundary: everything chained ABOVE it configures the
 * scenario (and is validated at chain-build time), everything chained BELOW it runs against the
 * rendered DOM. The framework throws build errors if you cross the boundary in the wrong
 * direction — `.next(...)` before `.render()`, configuration after `.render()`, or omitting
 * `.render()` entirely.
 *
 * Maddox does NOT mock `loader` / `action` for you. The real route loader/action runs inside
 * `createRoutesStub` and any proxies it calls can be mocked via `mockThisFunction`. If you'd
 * rather stub a loader/action directly, opt in by calling `mockThisFunction(mockName, 'loader',
 * module)` (or `'action'`) yourself before chaining `shouldBeCalledWith` / `doesReturnWithPromise`.
 *
 * Every loader/action invocation that runs during the rendered scenario is recorded in
 * invocation order and passed to your `.test(err, response)` callback as an array of
 * `{ mockName, kind, value }` entries (`kind` is `'loader'` or `'action'`). Entries are pushed
 * on invoke (not on resolve), so the array order is deterministic even when React Router fans
 * loaders out in parallel; `value` is filled in once the loader/action resolves.
 *
 * Limitations match React Router's testing docs: `createRoutesStub` is aimed at hook-driven
 * components; production server middleware and full route-tree `matches` are not guaranteed
 * to match a live app.
 *
 * @see https://reactrouter.com/start/framework/testing
 */
class FrameworkRouteScenario extends Scenario {
  constructor(testContext) {
    super(testContext);

    this._scenarioType_ = constants.scenarioTypes.FrameworkRouteScenario;
    this._routeDescriptors_ = [];
    this._initialEntries_ = ['/'];
    this._stubAppContext_ = undefined;
    this._wrapperCallback_ = null;
    this._steps_ = [];
    this._renderCalled_ = false;
  }

  // Guardrail: configuration methods (anything that affects what render does) cannot be chained
  // after `.render()`. Surfaces a clear build error instead of silently no-op-ing.
  _assertConfigBeforeRender_(methodName) {
    preconditions
      .checkArgument(
        this._renderCalled_ === false,
        ErrorFactory.build(constants.errorMessages.FrameworkRouteConfigAfterRender)
      )
      .debug({ methodName })
      .test();
  }

  /**
   * Register one stub route for `createRoutesStub`. The route's real `loader` / `action`
   * (if present on `module`) run during the scenario unless you explicitly opt in to
   * mocking them by calling `mockThisFunction(mockName, 'loader', module)` /
   * `mockThisFunction(mockName, 'action', module)` yourself. Each `mockName` must be
   * unique across `addStub` calls (Maddox mock keys).
   *
   * @param {{ mockName: string, path: string, module: { default: unknown, loader?: Function, action?: Function, HydrateFallback?: Function }, id?: string, children?: unknown[], HydrateFallback?: Function }} descriptor
   * @returns {FrameworkRouteScenario}
   */
  addStub(descriptor) {
    this._assertConfigBeforeRender_('addStub');

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

    this._routeDescriptors_.push({
      mockName,
      path,
      module,
      id: descriptor.id,
      children: descriptor.children,
      HydrateFallback: descriptor.HydrateFallback
    });

    return this;
  }

  /**
   * @param {unknown[]} entries History entries for the stub (strings or location objects).
   * @returns {FrameworkRouteScenario}
   */
  withInitialEntries(entries) {
    this._assertConfigBeforeRender_('withInitialEntries');

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
    this._assertConfigBeforeRender_('withStubAppContext');
    this._stubAppContext_ = context;
    return this;
  }

  /**
   * Wrap the framework-built `<Stub initialEntries={...} />` element in React context providers
   * (Theme, Redux, QueryClient, Auth, i18n, etc.) before Testing Library renders it.
   *
   * The callback receives `children` — the already-built React element for the `Stub` — and
   * must return a new React element that wraps `children`. In a JSX-enabled project:
   *
   *   .withWrapper((children) => <ThemeProvider>{children}</ThemeProvider>)
   *
   * In plain JS:
   *
   *   import { createElement } from 'react';
   *   .withWrapper((children) => createElement(ThemeProvider, null, children))
   *
   * @param {(children: object) => object} wrapperFn
   * @returns {FrameworkRouteScenario}
   */
  withWrapper(wrapperFn) {
    this._assertConfigBeforeRender_('withWrapper');

    preconditions
      .shouldBeFunction(wrapperFn, ErrorFactory.build(constants.errorMessages.FrameworkRouteWrapperCallback))
      .debug({ wrapperFn })
      .test();

    this._wrapperCallback_ = wrapperFn;
    return this;
  }

  /**
   * Explicit render boundary. Mark the position in the chain where the component mounts;
   * everything above is configuration, everything below acts on the rendered DOM.
   *
   * @returns {FrameworkRouteScenario}
   */
  render() {
    this._renderCalled_ = true;
    this._steps_.push({ kind: 'render' });
    return this;
  }

  /**
   * Post-render interaction step. The callback receives Testing Library's `screen`, `waitFor`,
   * `render`, `cleanup`, and a `userEvent.setup()` instance. Must be chained AFTER `.render()`.
   *
   * @param {(ctx: { screen: object, waitFor: Function, render: Function, cleanup: Function, userEvent: object }) => void | Promise<void>} stepFn
   * @returns {FrameworkRouteScenario}
   */
  next(stepFn) {
    preconditions
      .checkArgument(
        this._renderCalled_ === true,
        ErrorFactory.build(constants.errorMessages.FrameworkRouteNextBeforeRender)
      )
      .test();

    preconditions
      .shouldBeFunction(stepFn, ErrorFactory.build(constants.errorMessages.FrameworkRouteNextStepFunction))
      .debug({ stepFn })
      .test();

    this._steps_.push({ kind: 'next', fn: stepFn });
    return this;
  }

  // ---------------------------------------------------------------------------
  // Inherited Scenario mock-configuration methods.
  //
  // Each one is overridden purely to enforce the "before render" guardrail and then forward to
  // the base implementation. Behavior is otherwise unchanged.
  // ---------------------------------------------------------------------------

  mockThisFunction(mockName, funcName, object) {
    this._assertConfigBeforeRender_('mockThisFunction');
    return super.mockThisFunction(mockName, funcName, object);
  }

  withTestFinisherFunction(mockName, funcName, iteration) {
    this._assertConfigBeforeRender_('withTestFinisherFunction');
    return super.withTestFinisherFunction(mockName, funcName, iteration);
  }

  shouldBeCalledWith(mockName, funcName, params) {
    this._assertConfigBeforeRender_('shouldBeCalledWith');
    return super.shouldBeCalledWith(mockName, funcName, params);
  }

  shouldBeCalledWithSubset(mockName, funcName, params) {
    this._assertConfigBeforeRender_('shouldBeCalledWithSubset');
    return super.shouldBeCalledWithSubset(mockName, funcName, params);
  }

  shouldBeCalled(mockName, funcName) {
    this._assertConfigBeforeRender_('shouldBeCalled');
    return super.shouldBeCalled(mockName, funcName);
  }

  shouldAlwaysBeCalledWith(mockName, funcName, params) {
    this._assertConfigBeforeRender_('shouldAlwaysBeCalledWith');
    return super.shouldAlwaysBeCalledWith(mockName, funcName, params);
  }

  shouldAlwaysBeCalledWithSubset(mockName, funcName, params) {
    this._assertConfigBeforeRender_('shouldAlwaysBeCalledWithSubset');
    return super.shouldAlwaysBeCalledWithSubset(mockName, funcName, params);
  }

  shouldAlwaysBeIgnored(mockName, funcName) {
    this._assertConfigBeforeRender_('shouldAlwaysBeIgnored');
    return super.shouldAlwaysBeIgnored(mockName, funcName);
  }

  doesReturn(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesReturn');
    return super.doesReturn(mockName, funcName, dataToReturn);
  }

  doesAlwaysReturn(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesAlwaysReturn');
    return super.doesAlwaysReturn(mockName, funcName, dataToReturn);
  }

  doesReturnWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesReturnWithPromise');
    return super.doesReturnWithPromise(mockName, funcName, dataToReturn);
  }

  doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesAlwaysReturnWithPromise');
    return super.doesAlwaysReturnWithPromise(mockName, funcName, dataToReturn);
  }

  doesReturnWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesReturnWithCallback');
    return super.doesReturnWithCallback(mockName, funcName, dataToReturn);
  }

  doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesAlwaysReturnWithCallback');
    return super.doesAlwaysReturnWithCallback(mockName, funcName, dataToReturn);
  }

  doesError(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesError');
    return super.doesError(mockName, funcName, dataToReturn);
  }

  doesErrorWithPromise(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesErrorWithPromise');
    return super.doesErrorWithPromise(mockName, funcName, dataToReturn);
  }

  doesErrorWithCallback(mockName, funcName, dataToReturn) {
    this._assertConfigBeforeRender_('doesErrorWithCallback');
    return super.doesErrorWithCallback(mockName, funcName, dataToReturn);
  }

  // ---------------------------------------------------------------------------
  // Execution
  // ---------------------------------------------------------------------------

  async _runStubTestBody_() {
    let rtlCleanup = null;
    const invocations = [];

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
        const hydrateFallback = d.HydrateFallback ?? d.module.HydrateFallback;

        if (typeof d.module.loader === 'function') {
          route.loader = this._wrapForCapture_(d.mockName, 'loader', d.module.loader, invocations);
          route.HydrateFallback = hydrateFallback ?? maddoxDefaultHydrateFallback;
        }
        if (typeof d.module.action === 'function') {
          route.action = this._wrapForCapture_(d.mockName, 'action', d.module.action, invocations);
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

      const ctx = {
        screen,
        waitFor,
        render,
        cleanup,
        userEvent: userEvent.setup()
      };

      for (const step of this._steps_) {
        if (step.kind === 'render') {
          const stubEl = createElement(Stub, { initialEntries: this._initialEntries_ });
          let elementToRender = stubEl;

          if (typeof this._wrapperCallback_ === 'function') {
            elementToRender = this._wrapperCallback_(stubEl);

            preconditions
              .shouldBeDefined(
                elementToRender,
                ErrorFactory.build(constants.errorMessages.FrameworkRouteWrapperReturn)
              )
              .debug({ elementToRender })
              .test();
          }

          render(elementToRender);
          rtlCleanup = cleanup;
        } else {
          await Promise.resolve(step.fn(ctx));
        }
      }
    } finally {
      if (typeof rtlCleanup === 'function') {
        rtlCleanup();
      }
    }

    return invocations;
  }

  // Wraps a route's loader/action so each invocation is recorded in `invocations` in the order
  // it was called (capture-on-invoke), with `value` filled in once the wrapped function resolves.
  _wrapForCapture_(mockName, kind, originalFn, invocations) {
    return async function maddoxCaptureWrapper(...args) {
      const entry = { mockName, kind, value: undefined };

      invocations.push(entry);

      const result = await originalFn.apply(this, args);

      entry.value = result;
      return result;
    };
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
      .checkArgument(
        this._routeDescriptors_.length > 0,
        ErrorFactory.build(constants.errorMessages.FrameworkRouteMissingRoutes)
      )
      .debug({ routeDescriptors: this._routeDescriptors_ })
      .test();

    preconditions
      .checkArgument(
        this._renderCalled_ === true,
        ErrorFactory.build(constants.errorMessages.FrameworkRouteMissingRender)
      )
      .test();
  }
}

export default FrameworkRouteScenario;
