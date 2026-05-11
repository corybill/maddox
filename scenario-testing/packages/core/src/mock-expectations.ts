/** Composite key for mockKey + funcKey */
function pairKey(mockKey: string, funcKey: string): string {
  return `${mockKey}\0${funcKey}`;
}

function parsePairKey(key: string): { mockKey: string; funcKey: string } {
  const i = key.indexOf('\0');
  return { mockKey: key.slice(0, i), funcKey: key.slice(i + 1) };
}

/**
 * Build-phase registrations for Maddox-style verification (compare to {@link MockRegistry} after run).
 */
export class MockExpectations {
  /** Per (mockKey, funcKey): expected args for call index `i` → `unknown[]` (Vitest `mock.calls[i]` shape). */
  private readonly argExpectations = new Map<
    string,
    Map<number, unknown[]>
  >();

  /** Per (mockKey, funcKey): exact expected total call count when using shouldBeCalled. */
  private readonly expectedCallCounts = new Map<string, number>();

  recordShouldBeCalledWith(
    mockKey: string,
    funcKey: string,
    callIndex: number,
    args: unknown[]
  ): void {
    const key = pairKey(mockKey, funcKey);
    let byIndex = this.argExpectations.get(key);
    if (!byIndex) {
      byIndex = new Map();
      this.argExpectations.set(key, byIndex);
    }
    byIndex.set(callIndex, args);
  }

  recordShouldBeCalled(
    mockKey: string,
    funcKey: string,
    expectedCount: number
  ): void {
    this.expectedCallCounts.set(pairKey(mockKey, funcKey), expectedCount);
  }

  /** Keys that have any expectation (args or count). */
  registeredPairs(): { mockKey: string; funcKey: string }[] {
    const keys = new Set<string>();
    for (const k of this.argExpectations.keys()) {
      keys.add(k);
    }
    for (const k of this.expectedCallCounts.keys()) {
      keys.add(k);
    }
    return [...keys].map(parsePairKey);
  }

  getArgExpectations(
    mockKey: string,
    funcKey: string
  ): Map<number, unknown[]> | undefined {
    return this.argExpectations.get(pairKey(mockKey, funcKey));
  }

  getExpectedCallCount(mockKey: string, funcKey: string): number | undefined {
    return this.expectedCallCounts.get(pairKey(mockKey, funcKey));
  }
}
