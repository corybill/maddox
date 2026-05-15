# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0] - 2026-05-15

### Added

- This **CHANGELOG** ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format).
- **GitHub Actions** workflow: checkout, **Node 20**, `npm ci`, `npm run build`, `npm test` on pushes to **`master`**.
- **`FrameworkRouteScenario`** (React Router **`createRoutesStub`**): automatic **`HydrateFallback`** when a route has a **`loader`** (React Router v7 expectation in tests), plus optional override via stub descriptor **`HydrateFallback`** or **`module.HydrateFallback`**.
- Unit coverage for **HydrateFallback** (default fallback vs custom descriptor vs module vs descriptor precedence).
- README **Troubleshooting** — **Testing stack debug params** (`formatDebugParams` from **`errr`**, aligned with **`Maddox.compare.*`** and precondition stacks).

### Breaking changes

- **Minimum Node.js raised to `>=20.0.0`** (`package.json` **`engines`**). Older runtimes are not supported on this release line.
- **`error.stack` debug blocks** when **`Maddox.compare.*`** (or other **errr** / **`preconditions.errr()`** paths) attach debug params: the embedded fragment is **`Debug Params:` + `util.inspect(...)`** (**errr 5.x**), not the legacy **`JSON.stringify`**-pretty-print style. **Tests or tooling that assert exact stack substrings** must update golden strings or use **`formatDebugParams` from `'errr'`** (see [README — Troubleshooting](./README.md#troubleshooting)). The **`noDebug`** compare option still suppresses compare-side debug embedding where applicable.

### Changed

- **Dependencies**: **`errr` ^5.2.0** (with **`formatDebugParams`** for stack formatting); **`preconditions` ^4.0.3** (pairs with **`errr` 5**). **`npm` `overrides`** keep **`errr`** pinned consistently across nested dependencies (`diff`, **`serialize-javascript`**, **`errr`** overrides retained).
- **Callback normalization** (**`Scenario`** — `doesReturnWithCallback`, `doesAlwaysReturnWithCallback`, `doesErrorWithCallback`): **`normalizeCallbackDataToReturn()`** replaces the **`JSON.stringify(... ) === '{}'`** sentinel. **`{}`** plain objects normalize to **`[]`**; **`{ foo: undefined }`**-style shapes are **no longer treated as `{}`** via stringify and **will fail** **`shouldBeArray`** instead of silently normalizing (**behavior change** vs 4.x if anyone relied on the old heuristic).
- **CLI (`bin/maddox.js`)**: merges combined perf results using **`structuredClone`** instead of **`JSON.parse(JSON.stringify(...))`**; **`--print` / `--print-all`** logs results with **`util.inspect`** (**`node:util`**) instead of **`JSON.stringify`**.
- **`Mock` cloning** (`lib/mocks/mock.js`): safe clone path uses **`structuredClone`** instead of JSON round-trip.
- **`FrameworkRouteScenario`**: route objects built for the stub expose **`HydrateFallback`** beside wrapped **`loader`** when a loader exists (**`dist/`** regenerated).
- **Published `dist/`** (**`index.js`**, **`index.cjs`**) rebuilt from **`lib/`** so consumers get **`normalizeCallbackDataToReturn`**, **HydrateFallback** wiring, and consistent bundles.
- **Unit tests**: compare and proxy suites assert **`error.stack`** fragments via **`formatDebugParams`**; HTTP response-finisher assertions derive expected **`util.inspect`** text from **`constants.ResponseEndFunctions`** instead of duplicated string literals.

### Removed

- **`spec/support/errr-debug.js`**: callers use **`formatDebugParams`** from **`errr`** directly.
- **JSON-based** deep-merge for persisted perf results (**`CombineResults`** path) and **JSON stringify** sentinel for “empty-object means empty callback params” (**replaced by** **`structuredClone`** / **`normalizeCallbackDataToReturn`**, respectively).
