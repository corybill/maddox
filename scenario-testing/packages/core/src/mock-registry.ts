import type { Mock } from 'vitest';

export type MockCall = unknown[];

/** Vitest-native keyed mocks with recorded invocations. */
export class MockRegistry {
  private readonly mocks = new Map<string, Map<string, Mock>>();

  /** Register or replace a mock function under mockKey.funcKey */
  setMock(mockKey: string, funcKey: string, fn: Mock): void {
    let group = this.mocks.get(mockKey);
    if (!group) {
      group = new Map();
      this.mocks.set(mockKey, group);
    }
    group.set(funcKey, fn);
  }

  getMock(mockKey: string, funcKey: string): Mock | undefined {
    return this.mocks.get(mockKey)?.get(funcKey);
  }

  /** Returns shallow copies of recorded args per call (same mock key / func key). */
  getCalls(mockKey: string, funcKey: string): MockCall[] {
    const m = this.getMock(mockKey, funcKey);
    if (!m) return [];
    return m.mock.calls.map((c) => [...c]);
  }

  callCount(mockKey: string, funcKey: string): number {
    return this.getMock(mockKey, funcKey)?.mock.calls.length ?? 0;
  }

  resetAll(): void {
    for (const group of this.mocks.values()) {
      for (const fn of group.values()) {
        fn.mockReset();
      }
    }
  }
}
