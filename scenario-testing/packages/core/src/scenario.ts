import type { RunnerContext } from './runner-context.js';
import { MockExpectations } from './mock-expectations.js';
import { MockRegistry } from './mock-registry.js';
import { verifyMockExpectations } from './verify-mocks.js';

export type ScenarioRunResult = {
  title: string;
  mockRegistry: MockRegistry;
};

/**
 * Base fluent scenario (build phase). Subpackages add framework-specific `.run()` steps.
 */
export class Scenario {
  protected readonly runner: RunnerContext;
  readonly mocks = new MockRegistry();
  /** Expected mock args / call counts (build phase); consumed by {@link verifyMocks}. */
  readonly expectations = new MockExpectations();
  protected readonly title: string;

  constructor(runner: RunnerContext) {
    this.runner = runner;
    this.title = runner.fullTitle();
  }

  getRunner(): RunnerContext {
    return this.runner;
  }

  /**
   * Register expected arguments for the nth call (0-based) to `mockKey.funcKey`.
   * At verify time, total calls must equal `max(callIndex) + 1` with contiguous indices from `0`.
   */
  shouldBeCalledWith(
    mockKey: string,
    funcKey: string,
    callIndex: number,
    args: unknown[]
  ): this {
    this.expectations.recordShouldBeCalledWith(mockKey, funcKey, callIndex, args);
    return this;
  }

  /** Expect exactly `expectedCount` invocations (no per-arg check unless also using shouldBeCalledWith). */
  shouldBeCalled(
    mockKey: string,
    funcKey: string,
    expectedCount: number
  ): this {
    this.expectations.recordShouldBeCalled(mockKey, funcKey, expectedCount);
    return this;
  }

  /** Compare registered mocks to Vitest call history (run after scenario execution). */
  verifyMocks(): void {
    verifyMockExpectations(this.mocks, this.expectations);
  }

  /** Snapshot metadata for assertions / reporting after a run. */
  snapshot(): ScenarioRunResult {
    return { title: this.title, mockRegistry: this.mocks };
  }
}
