/**
 * Middleware + createRoutesStub: React Router documents that createRoutesStub is for isolated
 * unit tests and does not replicate a full production server pipeline. Middleware ordering and
 * execution relative to loaders/actions should be validated with integration/E2E tests against
 * a running app when that behavior is critical.
 *
 * @see https://reactrouter.com/start/framework/testing
 */
describe('FrameworkRouteScenario middleware note', function () {
  it.skip('would assert middleware vs loader order against createRoutesStub when a stable harness API exists', function () {
    // Intentionally skipped: stub behavior is version-specific; document here rather than flake in CI.
  });
});
