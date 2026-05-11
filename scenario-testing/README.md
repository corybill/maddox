# Scenario testing toolkit (`@scenario-testing/*`)

Self-contained **npm workspaces** for Vitest-first, scenario-style integration testing. **React Router 7 Framework-mode** is the first target; packages are safe to lift into a standalone repository later.

**Product contract** (maintainer-owned scope vs external scenario wishlists): [`component-test-scenarios/FRAMEWORK-CONTRACT.md`](component-test-scenarios/FRAMEWORK-CONTRACT.md).

## Layout

| Path | Purpose |
|------|---------|
| [`packages/core`](packages/core) | `@scenario-testing/core` — runner context (`vitestRunnerContext`), `Scenario`, `MockRegistry`, **mock expectations** (`shouldBeCalledWith` / `shouldBeCalled`), **`verifyMocks()`**. |
| [`packages/react-router`](packages/react-router) | `@scenario-testing/react-router` — `RouteScenario`, `createRoutesStub`, ordered **`step()`** + **`run()`** (build → run → verify). Stub helpers **`outletParentRoute`** / **`leafRoute`** encode nested layouts so `useRouteLoaderData(routeId)` matches production route ids. **`StepContext.advanceTimersByTime`** wraps Vitest fake timers in RTL **`act`** (see contract doc for fake-timer + loader caveats). |
| [`apps/rr7-framework-fixture`](apps/rr7-framework-fixture) | Minimal RR7 Framework app (SSR-capable build) used to validate the toolkit. |

## Maddox-style phases (React Router)

Designed for **one large `it(...)` per route flow** (single mount, sequential UI, one verification pass):

1. **Build** — `mockThisFunction`, `shouldBeCalledWith` / `shouldBeCalled`, `withStubRoutes`.
2. **Run** — `step(...)` callbacks (async-safe), then **`await scenario.run()`** which mounts once, runs steps with **`userEvent.setup()`**, then **`verifyMocks()`**.
3. **Verify** — Vitest `expect` compares each registered **`vi.fn`** call to expectations (call count and per-index args).

Example shape:

```ts
const scenario = createRouteScenario(ctx);
scenario.mockThisFunction('api', 'submit');
scenario.withStubRoutes({ routes: [/* loader passes scenario.mocks.getMock(...) */] });
scenario.shouldBeCalledWith('api', 'submit', 0, [{ text: 'hello' }]);

await scenario
  .step(async ({ screen, userEvent }) => {
    await userEvent.type(await screen.findByTestId('field'), 'hello');
  })
  .step(async ({ screen, userEvent }) => {
    await userEvent.click(await screen.findByTestId('submit'));
  })
  .run();
```

`StepContext` also exposes `expect`, `waitFor`, `container`, and `mocks`.

### Parity scope (vs Maddox)

| Maddox | `@scenario-testing/*` (current) |
|--------|-----------------------------------|
| `mockThisFunction` | Yes (`vi.fn`) |
| `shouldBeCalledWith` (by call index) | Yes — indices must be contiguous from `0` through `max`; total calls = `max + 1` |
| `shouldBeCalled` (exact call count) | Yes |
| `shouldAlways*` / subset matchers | Not yet |
| HTTP response mocks | N/A for stub router |

For **render-only** smoke tests without steps/verify, **`render()`** still returns `{ unmount, container }` (no automatic `verifyMocks`).

## Install & commands

Workspaces are **nested** under this directory so the publishable **Maddox** root package is unchanged.

```bash
cd scenario-testing
npm install
npm test
npm run build --workspace=@scenario-testing/core
npm run build --workspace=@scenario-testing/react-router
npm run build --workspace=@scenario-testing/rr7-framework-fixture
```

Internal packages reference each other with `"@scenario-testing/core": "*"` etc., resolved by npm workspaces.

## Maddox

This toolkit is **not** a runtime dependency of the `maddox` npm package. See [`LINEAGE.md`](LINEAGE.md).

## Publishing

Use npm scope **`@scenario-testing`** (configure access on npmjs). Builds emit `dist/` + typings per package.

## Notes

`createRoutesStub` may log `No HydrateFallback element provided...` during tests; it does not fail the suite. Suppress later by providing a stub `HydrateFallback` route if desired.

Async routes: use **`findBy*`** or **`waitFor`** inside steps so loaders can resolve before queries.
