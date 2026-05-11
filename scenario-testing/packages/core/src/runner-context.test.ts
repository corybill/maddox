import { describe, expect, it, vi } from 'vitest';
import { vitestRunnerContext } from './runner-context.js';

describe('vitestRunnerContext', () => {
  it('maps skip and builds fullTitle from nested suites', () => {
    const skip = vi.fn();
    const outerSuite = { name: 'Given X', suite: undefined };
    const innerSuite = { name: 'When Y', suite: outerSuite };
    const ctx = {
      skip,
      task: {
        name: 'child it',
        suite: innerSuite,
      },
    } as unknown as import('vitest').TestContext;

    const r = vitestRunnerContext(ctx);
    r.skip('later');
    expect(skip).toHaveBeenCalledWith('later');
    expect(r.fullTitle()).toBe('Given X When Y child it');
  });
});
