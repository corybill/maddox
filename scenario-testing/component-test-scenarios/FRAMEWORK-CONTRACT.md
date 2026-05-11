# Scenario testing framework — product contract

This document is owned by the `@scenario-testing/*` maintainers. The scenario catalogs in [`SCENARIOS.md`](SCENARIOS.md) and [`FRAMEWORK-REQUIREMENTS-PROMPT.md`](FRAMEWORK-REQUIREMENTS-PROMPT.md) are **research**: they describe how an app team wants to test React Router surfaces. We translate that into **problems** and **explicit API boundaries**, not a line‑for‑line DSL checklist.

## Underlying problems (why this toolkit exists)

1. **Single-flow integration tests** — One mount, ordered interactions, one verification pass at the end (Maddox-style build → run → verify), without hand-rolling `act` + `waitFor` choreography every time.

2. **No live data plane in default flows** — Loaders and actions are **not** treated as integration targets; tests supply return values through stubs (same philosophy as Maddox mocks). The goal is UI and wiring correctness, not proving server code.

3. **React Router as the composition root** — Components under test assume `RouterProvider`, nested routes, `Link`, `Outlet`, and data hooks. Tests need a **stub route tree** (`createRoutesStub`) plus optional **Vitest mocks** for side-effect hooks or services.

4. **Observable seams** — Teams want to assert **mock calls** (navigate, submit, domain services) and **DOM** (RTL), not reimplement React Router internals.

5. **Route-context data** — Child routes read parent data via `useRouteLoaderData(routeId)` and layout context via `Outlet`. Tests must be able to **assign stable route ids** on stub routes so those hooks resolve predictably.

## What we ship today (Tier 1)

| Capability | How we express it |
|------------|-------------------|
| Stub route tree + initial URL | `RouteScenario.withStubRoutes({ routes, initialEntries })` — wraps `createRoutesStub`. |
| Seed loader/action outputs | Route objects with `loader` / `action` returning test-controlled data (and throwing when simulating errors). |
| Parent vs child loader addressing | Stub routes use **`id` strings** that match what production code passes to `useRouteLoaderData(...)`. Use nested routes + layout `Component` that renders `<Outlet />`. Helpers: `outletParentRoute`, `leafRoute` from `@scenario-testing/react-router`. |
| Ordered UI drivers | `step(...)` callbacks with RTL `screen`, `userEvent`, `waitFor`. |
| Mock registry + verify | `mockThisFunction`, `shouldBeCalledWith` / `shouldBeCalled`, `await scenario.run()` → `verifyMocks()`. |
| Debounce / timers in steps | `StepContext.advanceTimersByTime(ms)` — runs Vitest timer advancement inside RTL `act`. Enable `vi.useFakeTimers()` when appropriate. **Caution:** enabling fake timers *before* mount often prevents stub loaders and RTL async queries from completing (React Router and Testing Library rely on real timers). Prefer enabling fake timers only after the route has rendered (e.g. a later step), or use `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` for typing-focused debounce tests. |

## Tier 2 (next; patterns first, APIs later)

- **Fetcher-heavy screens** — Document patterns (`useFetcher` state, multiple instances) via stub `action` + component-level test doubles; consider thin helpers only after repeated duplication.

- **Redirect-only / loader `redirect()`** — Often clearer as **loader unit tests** or **static handler** assertions. Component scenarios focus on **what mounts**; asserting “loader returned redirect X” without rendering may remain **documented out-of-band** unless React Router exposes a stable stub-side hook.

- **`ErrorBoundary` vs loader-throw** — Represent with route `loader` throwing / route `ErrorBoundary` export on stub objects; exact ergonomics depend on RR stub behavior—prefer examples over magic wrappers.

- **Optional child prop spies** — Prefer explicit `vi.spyOn` / wrapper components in app tests; not a default framework behavior (non-goal: auto-mock children).

## Explicit non-goals

- Invoking real loaders, actions, or network I/O in the default DSL.
- Globally intercepting or replacing React Router hooks outside the stub router (no shadow `react-router` module by default).
- Auto-mocking child components or replacing RTL.

## Mapping client “wishlist” names to our vocabulary

| Client doc phrase | Our contract |
|-------------------|--------------|
| `.withLoaderData` | Loader function on the stub route returns that shape. |
| `.withParentLoaderData(routeId, …)` | Parent stub route with `id: routeId` and `loader: () => data`; layout renders `<Outlet />`. |
| `.withOutletContext` | Provide via parent `loader` + components that read `useRouteLoaderData` / RR patterns; true `useOutletContext` seeding follows RR stub capabilities—document per release. |
| `.shouldRedirectTo` | Prefer focused loader tests or documented stub navigation inspection when supported; not guaranteed in Tier 1. |
| `.withFetcher("notes", …)` | App-specific mocking / action stubs—not part of core until we have a second concrete consumer. |

## Change policy

New APIs must either **remove duplication** across multiple apps or **encode a stable RR stub pattern**. Wishlist names from external prompts are **non-binding**; this file and [`../README.md`](../README.md) define the supported contract.
