import type { TestContext } from 'vitest';

/** Minimal test-runner surface (Vitest-first; avoids Mocha `this`). */
export type RunnerContext = {
  skip: (note?: string) => void;
  fullTitle: () => string;
};

function fullTitleFromTask(task: TestContext['task']): string {
  const parts: string[] = [];
  let suite = task.suite;
  while (suite) {
    if (suite.name) {
      parts.unshift(suite.name);
    }
    suite = suite.suite;
  }
  parts.push(task.name);
  return parts.filter(Boolean).join(' ');
}

/**
 * Map Vitest `TestContext` to `RunnerContext` for scenario constructors.
 */
export function vitestRunnerContext(ctx: TestContext): RunnerContext {
  return {
    skip: (note?: string) => {
      ctx.skip(note);
    },
    fullTitle: () => fullTitleFromTask(ctx.task),
  };
}
