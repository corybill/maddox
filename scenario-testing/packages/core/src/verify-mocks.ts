import { expect } from 'vitest';
import type { Mock } from 'vitest';
import type { MockExpectations } from './mock-expectations.js';
import type { MockRegistry } from './mock-registry.js';

/**
 * Verify Vitest mock call history against {@link MockExpectations}.
 * Uses Vitest `expect` for diffs (requires vitest peer).
 */
export function verifyMockExpectations(
  registry: MockRegistry,
  expectations: MockExpectations
): void {
  const pairs = expectations.registeredPairs();

  for (const { mockKey, funcKey } of pairs) {
    const mock = registry.getMock(mockKey, funcKey) as Mock | undefined;
    expect(
      mock,
      `No mock registered for ${mockKey}.${funcKey} — call mockThisFunction first`
    ).toBeDefined();

    const countExpected = expectations.getExpectedCallCount(mockKey, funcKey);
    const argMap = expectations.getArgExpectations(mockKey, funcKey);

    if (countExpected !== undefined) {
      expect(mock!, `${mockKey}.${funcKey} call count`).toHaveBeenCalledTimes(
        countExpected
      );
    }

    if (argMap && argMap.size > 0) {
      const indices = [...argMap.keys()].sort((a, b) => a - b);
      const maxIdx = indices[indices.length - 1]!;
      expect(
        mock!.mock.calls.length,
        `${mockKey}.${funcKey}: expected ${maxIdx + 1} calls (indices 0..${maxIdx})`
      ).toBe(maxIdx + 1);

      for (const i of indices) {
        const expectedArgs = argMap.get(i)!;
        expect(
          mock!.mock.calls[i],
          `${mockKey}.${funcKey} call index ${i} args`
        ).toEqual(expectedArgs);
      }
    }
  }
}
