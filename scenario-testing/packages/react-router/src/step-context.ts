import type {
  act as actFn,
  screen as screenFn,
  waitFor as waitForFn,
} from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { MockRegistry } from '@scenario-testing/core';
import type { RunnerContext } from '@scenario-testing/core';
import type { expect as expectFn } from 'vitest';

/** Passed to each `step` callback during {@link RouteScenario.run}. */
export type StepContext = {
  screen: typeof screenFn;
  container: HTMLElement;
  userEvent: UserEvent;
  mocks: MockRegistry;
  getRunner: () => RunnerContext;
  expect: typeof expectFn;
  waitFor: typeof waitForFn;
  /** RTL `act`; use when a step performs updates that must be wrapped (rare — prefer userEvent). */
  act: typeof actFn;
  /**
   * Advance Vitest fake timers by `ms` inside `act`. Call `vi.useFakeTimers()` in the test
   * (e.g. `beforeEach`) when exercising debounced handlers.
   */
  advanceTimersByTime: (ms: number) => Promise<void>;
};

export type RouteStep = {
  name?: string;
  run: (ctx: StepContext) => void | Promise<void>;
};
