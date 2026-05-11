import { act, render, screen, waitFor } from '@testing-library/react';
import { userEvent as userEventPlugin } from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import type { Mock } from 'vitest';
import { expect } from 'vitest';
import { vi } from 'vitest';
import type { RunnerContext } from '@scenario-testing/core';
import { Scenario } from '@scenario-testing/core';
import type { RouteStep, StepContext } from './step-context.js';

export type StubRouteOptions = {
  routes: Parameters<typeof createRoutesStub>[0];
  /** Passed to the stub router as `initialEntries` (default `['/']`). */
  initialEntries?: string[];
};

/**
 * Maddox-style scenario for React Router: compose stub routes (loaders/actions mocked here),
 * ordered UI steps, then {@link Scenario.verifyMocks}.
 */
export class RouteScenario extends Scenario {
  private stubOptions: StubRouteOptions | null = null;
  private readonly steps: RouteStep[] = [];

  constructor(runner: RunnerContext) {
    super(runner);
  }

  /**
   * Declare routes for `createRoutesStub`. Loader/action functions should return mocked data
   * (same philosophy as Maddox: no live IO in default flows).
   */
  withStubRoutes(options: StubRouteOptions): this {
    this.stubOptions = options;
    return this;
  }

  /** Attach a Vitest mock under `mockKey.funcKey` for assertions via {@link Scenario.mocks}. */
  mockThisFunction(
    mockKey: string,
    funcKey: string,
    impl?: (...args: unknown[]) => unknown
  ): this {
    const fn: Mock = impl ? vi.fn(impl) : vi.fn();
    this.mocks.setMock(mockKey, funcKey, fn);
    return this;
  }

  /** Append an async UI step (run phase). Chain multiple steps before {@link run}. */
  step(run: (ctx: StepContext) => void | Promise<void>): this;
  step(
    name: string,
    run: (ctx: StepContext) => void | Promise<void>
  ): this;
  step(
    a: string | ((ctx: StepContext) => void | Promise<void>),
    b?: (ctx: StepContext) => void | Promise<void>
  ): this {
    if (typeof a === 'function') {
      this.steps.push({ run: a });
    } else {
      this.steps.push({ name: a, run: b! });
    }
    return this;
  }

  /**
   * Mount once via `createRoutesStub`, run steps in order, then {@link Scenario.verifyMocks}.
   * Use one large `it(...)` per scenario (see README).
   */
  async run(): Promise<void> {
    if (!this.stubOptions) {
      throw new Error('RouteScenario: call withStubRoutes() before run()');
    }

    const { unmount, container } = this.mount();

    const userEvent = userEventPlugin.setup();

    const ctx: StepContext = {
      screen,
      container,
      userEvent,
      mocks: this.mocks,
      getRunner: () => this.getRunner(),
      expect,
      waitFor,
      act,
      advanceTimersByTime: async (ms: number) => {
        await act(async () => {
          vi.advanceTimersByTime(ms);
        });
      },
    };

    try {
      for (const step of this.steps) {
        await step.run(ctx);
      }
      this.verifyMocks();
    } finally {
      unmount();
    }
  }

  /**
   * Render stub routes once (no steps, no verify). Prefer {@link run} for build/run/verify flows.
   */
  render(): { unmount: () => void; container: HTMLElement } {
    return this.mount();
  }

  private mount(): { unmount: () => void; container: HTMLElement } {
    if (!this.stubOptions) {
      throw new Error(
        'RouteScenario: call withStubRoutes() before render()'
      );
    }
    const Stub = createRoutesStub(this.stubOptions.routes);
    const initialEntries = this.stubOptions.initialEntries ?? ['/'];
    const view = render(<Stub initialEntries={initialEntries} />);
    return { unmount: view.unmount, container: view.container };
  }
}
