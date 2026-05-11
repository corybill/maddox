import type { TestContext } from 'vitest';
import { vitestRunnerContext } from '@scenario-testing/core';
import { RouteScenario } from './route-scenario.js';

/** Vitest-friendly factory — pass the test context from `it(..., (ctx) => { ... })`. */
export function createRouteScenario(ctx: TestContext): RouteScenario {
  return new RouteScenario(vitestRunnerContext(ctx));
}
