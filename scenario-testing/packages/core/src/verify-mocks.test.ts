import { describe, expect, it, vi } from 'vitest';
import { MockRegistry } from './mock-registry.js';
import { MockExpectations } from './mock-expectations.js';
import { verifyMockExpectations } from './verify-mocks.js';

describe('verifyMockExpectations', () => {
  it('passes when args match each call index', () => {
    const registry = new MockRegistry();
    const fn = vi.fn();
    fn('a');
    fn({ x: 1 });
    registry.setMock('api', 'send', fn);

    const exp = new MockExpectations();
    exp.recordShouldBeCalledWith('api', 'send', 0, ['a']);
    exp.recordShouldBeCalledWith('api', 'send', 1, [{ x: 1 }]);

    expect(() =>
      verifyMockExpectations(registry, exp)
    ).not.toThrow();
  });

  it('throws when call count differs from max index + 1', () => {
    const registry = new MockRegistry();
    const fn = vi.fn();
    fn('only');
    registry.setMock('api', 'send', fn);

    const exp = new MockExpectations();
    exp.recordShouldBeCalledWith('api', 'send', 0, ['only']);
    exp.recordShouldBeCalledWith('api', 'send', 1, ['missing']);

    expect(() => verifyMockExpectations(registry, exp)).toThrow();
  });

  it('respects shouldBeCalled count', () => {
    const registry = new MockRegistry();
    const fn = vi.fn();
    fn();
    fn();
    registry.setMock('x', 'y', fn);

    const exp = new MockExpectations();
    exp.recordShouldBeCalled('x', 'y', 2);

    expect(() =>
      verifyMockExpectations(registry, exp)
    ).not.toThrow();
  });
});
