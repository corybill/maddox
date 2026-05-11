# React Router Component Test Scenarios

These are the use cases for a Maddox-light scenario testing framework targeting React Router (v7 / Remix-style flat routes). Each section covers one route file in `fantasypilot-app/fantasypilot-ui/app/routes/` and lists the **Component-level scenarios** the framework must support.

The framework's scope is **the rendered React tree only**. Loaders, actions, services, fetchers, and route hooks are mocked. The framework provides ergonomic primitives for:

- seeding `loaderData` (and parent-route loader data)
- seeding `actionData`
- seeding URL `pathname` + `searchParams`
- mocking `useFetcher`, `useNavigate`, `useSearchParams`, `useRouteLoaderData`, `useOutletContext`, `useParams`
- mocking project hooks
- asserting rendered DOM, mock calls, URL changes, redirects, and ErrorBoundary mounting

Route inventory:

| Route file | Renders | Highlights |
|---|---|---|
| `leagues._index.tsx` | `<LeaguesDashboard />` | own loader + action; ErrorBoundary; debounced search; URL-driven filters |
| `leagues.$leagueId.tsx` | `<LeagueDetailPage />` (with `<Outlet />`) | layout; ErrorBoundary; loader-side redirect; provides `useRouteLoaderData` to children |
| `leagues.$leagueId.overview.tsx` | `<TabOverview />` + tables | reads parent loader; normalizes object/array shapes |
| `leagues.$leagueId.draft.tsx` | `<TabDraft />` | trivial passthrough; loader throws on error |
| `leagues.$leagueId.matchups.tsx` | `<TabMatchups />` | reads parent loader; week selector via `<Link>` URLs |
| `leagues.$leagueId.roster._index.tsx` | `null` (redirect-only) | redirect from loader; nothing to render |
| `leagues.$leagueId.roster.$rosterId.tsx` | `<TabRoster />` | reads parent loader; navigates via `useNavigate` |
| `leagues.$leagueId.standings.tsx` | `<TabStandings />` | reads parent loader |
| `leagues.$leagueId.strategy.tsx` | `<TabStrategy />` | own `action`; consumes `actionData`; two `useFetcher` instances |
| `leagues.$leagueId.transactions.tsx` | `<TabTransactions />` | trivial |

---

## 1. `leagues._index.tsx`

The route Component is a thin wrapper that spreads `loaderData` into `LeaguesDashboard`. All scenarios target the rendered tree.

### A. `loaderData`-driven render shapes

1. **Happy path render** — `loaderData = { leagues: [3 mixed-status], statTiles: {…}, availableYears: [2026,2025], currentSeason: 2026, error: null }` → asserts `BreadcrumbBar`, `DashboardHeader`, `YearSwitcher`, `StatBanner`, `HeroSpotlightCard`, `LeagueList` all render; subtitle reads `"3 of 3 leagues"`.
2. **Error from loader** — `loaderData.error = "Sleeper down"` → only `BreadcrumbBar` + the error message render (no stats, no list, no spotlight).
3. **No leagues yet** — `loaderData.leagues = []` → `EmptyState variant="none"` renders; `StatBanner`/`HeroSpotlightCard`/`SearchAndFilters` do **not** render.
4. **Filters yield zero** — leagues exist but none match active year/status → `EmptyState variant="filtered"` renders; clicking it calls the clear-all handler.
5. **Spotlight selection** — leagues span every status; spotlight is the highest-priority status (`drafting` > `pre_draft` > `in_season` > `completed`); the rest go into `LeagueList`.
6. **Sort by `draftStartTime`** — two `pre_draft` leagues; earlier `draftStartTime` becomes spotlight.
7. **Sort by `draftDays`** — two `pre_draft` leagues without `draftStartTime`; smaller `draftDays` wins.
8. **Sort fallback to name** — two `completed` leagues sort alphabetically.
9. **Subtitle pluralization & "(filtered)" suffix** — verifies `${filtered}/${total} leagues (filtered)` text given a query.

### B. URL / `searchParams`-driven render

10. **Default year = `currentSeason`** — no `?year` param, leagues across years; only `currentSeason` leagues survive filtering.
11. **`?year=2025`** — only 2025 leagues survive; `YearSwitcher` reflects 2025 active.
12. **`?q=dynasty`** — case-insensitive name match filters list; `SearchAndFilters` initial input value = "dynasty".
13. **`?status=in_season`** — only `in_season` leagues survive.
14. **Combined `?year=2025&q=dynasty&status=in_season`** — all three apply together.

### C. `mode` prop branching

15. **`mode="player"` (default)** — breadcrumbs = `[Leagues]`; `StatBanner` shows 4 tiles (incl. Open Trades, Waiver Claims).
16. **`mode="commissioner"`** — breadcrumbs = `[Commissioner, Leagues]`; title = "Your Leagues"; `StatBanner` shows 2 tiles only.

### D. Interaction → URL / hook scenarios

17. **Debounced search** — type "dyn" into search input, advance fake timers 300ms → URL gains `?q=dyn`. Typing again within 300ms cancels the prior write.
18. **Back-button sync** — when `?q` param changes externally, the input reflects it (driven by `useEffect` on the `initialQ`).
19. **Year switch** — click a `YearSwitcher` year → URL gains `?year=2025`.
20. **Toggle status filter** — click "in_season" filter → `?status=in_season`. Click again → param removed.
21. **Clear all** — with `?year=2025&q=foo&status=in_season`, click Clear All → only `?year=2025` remains; local search box clears.
22. **Refresh button** — click `BreadcrumbBar` refresh → mocked `useLeagueRefresh().refresh` was called once. With `isRefreshing=true` mock, button shows refreshing state.

### E. `ErrorBoundary` route export

23. **Loader-thrown** — when the framework simulates a loader rejection, the route's exported `ErrorBoundary` is what mounts; assert the "Error" card renders. (Distinct from #2, where the loader returns a structured `error` field.)

### F. `action` round-trip

24. **Submit `intent=refresh`** — assert the mocked action was called with the right form data / search params; assert the resolved `actionData` shape (`{ success, intent: "refresh", message, summary }`) is exposed via the framework's hook mock.
25. **Action error** — mocked action rejects → `actionData = { success: false, message }`. Component does not render this today, but the test guards future toast wiring.

---

## 2. `leagues.$leagueId.tsx` (layout route)

The Component renders an error card when `loaderData.error`, otherwise renders `LeagueDetailPage` (which itself either renders "League not found" or breadcrumb + header + tab bar + `<Outlet />`). Has a separate exported `ErrorBoundary` and a loader-side redirect from `/leagues/:leagueId` → `/leagues/:leagueId/overview`.

1. **Loader returns `error` field** — Component renders the inline "Error" Card with `data.error` text. `LeagueDetailPage` is **not** rendered.
2. **Loader returns `league: null` (no error)** — `LeagueDetailPage` renders the "League not found" branch (breadcrumb only, no header/tab bar/outlet).
3. **League present** — renders `LeagueDetailBreadcrumb`, `LeagueHeader`, `LeagueTabBar`, and the `<Outlet />` container with class `flex-1 overflow-y-auto px-6 py-6`.
4. **`league.leagueId` vs `league.sleeperLeagueId`** — `LeagueTabBar` receives `leagueId` derived from `leagueId ?? sleeperLeagueId`.
5. **`<Outlet />` context** — children rendered through `<Outlet />` see `{ league, currentNflWeek }` via `useOutletContext()`.
6. **`useRouteLoaderData("routes/leagues.$leagueId")`** — children rendered through `<Outlet />` can read the parent's full loader data through `useRouteLoaderData`. Several child routes use this.
7. **`ErrorBoundary` exported** — when the framework simulates a loader throw (vs. catch-and-return), the exported `ErrorBoundary` mounts and renders the generic "An error occurred while loading league details. Please try again." card.
8. **Redirect from base path** — when URL is exactly `/leagues/:leagueId`, the loader returns `redirect("/leagues/:leagueId/overview")`. Framework should support asserting "loader resolved to a redirect to X" without rendering anything.

---

## 3. `leagues.$leagueId.overview.tsx`

Renders `TabOverview` + `LeagueSettingsTable` + `LeagueScoringTable`. Reads parent loader for `league` (and the league's `children.rosterSlots` / `children.scoringRules`, which can arrive as either an object or an array).

1. **Happy path** — `loaderData = { allRosters, userRoster, nextMatchup, recentTransactions }` plus parent `{ league }` → renders `NextMatchupCard` (inside `TabOverview`), `LeagueSettingsTable`, and `LeagueScoringTable`.
2. **`rosterSlots` as array** — passes through unchanged to `LeagueSettingsTable`.
3. **`rosterSlots` as object** — converted via `Object.values(...)` before passing to `LeagueSettingsTable`.
4. **`rosterSlots` missing** — falls back to `[]`, table renders empty.
5. **`scoringRules` as array** — passes through unchanged to `LeagueScoringTable`.
6. **`scoringRules` as object** — converted via `Object.values(...)`.
7. **`scoringRules` missing** — falls back to `[]`.
8. **`league` missing in parent loader** — `leagueId` is `undefined`; `NextMatchupCard` receives `leagueId={undefined}`; `LeagueSettingsTable` receives `league={undefined}`. Should still render without throwing.
9. **`useRouteLoaderData("routes/leagues.$leagueId")` mock** — framework lets the test seed parent loader data per route id.
10. **ErrorBoundary** — loader throws → parent route's `ErrorBoundary` mounts (the child route doesn't export its own).

---

## 4. `leagues.$leagueId.draft.tsx`

Trivial passthrough: `<TabDraft draft={...} userDraftPicks={...} />`.

1. **Happy path** — both `draft` and `userDraftPicks` present → `DraftDetailsCard` and `UserPicksList` both render.
2. **Null `draft`** — `DraftDetailsCard` and `UserPicksList` still render (defensive child rendering).
3. **Empty `userDraftPicks`** — `UserPicksList` still renders (asserts behavior of empty list — likely an empty/zero state).
4. **Loader throws** — parent's `ErrorBoundary` mounts.

This is the simplest case in the suite; primarily a regression test that the props are wired through.

---

## 5. `leagues.$leagueId.matchups.tsx`

`TabMatchups` renders an 18-week selector and a grid of matchup cards. Reads parent loader for `league` and `currentNflWeek`.

1. **Empty groups** — `weekMatchups = { week: 5, groups: [] }` → "No matchups loaded for this week. Sync via the Chrome extension to populate." renders; week selector still visible.
2. **Active week comes from `weekMatchups.week`** — when `weekMatchups.week=7` and `currentNflWeek=4`, the week-7 link is the active one.
3. **Active week falls back to `currentNflWeek`** — when `weekMatchups` is null but parent provides `currentNflWeek=4`.
4. **No active week** — both null → no link is in the active style.
5. **Week selector links** — each link goes to `/leagues/:leagueId?tab=matchups&week=N` for N=1..18.
6. **Matchup card render** — one card per group with both teams' names + scores + a `WeekBadge`.
7. **Roster name fallback chain** — `team_name` > `displayName` > `username` > `Team N` from `usersById[ownerId]`.
8. **Missing user in `usersById`** — falls back to `Team ?` when `sleeperRosterIndex` is also missing.
9. **Score formatting** — `points` undefined → `—`; numeric → `points.toFixed(1)`.
10. **Roster name links** — go to `/leagues/:leagueId/roster/:rosterId` for both teams in each card.
11. **Parent loader read** — uses `useRouteLoaderData("routes/leagues.$leagueId")` to get `{ league, currentNflWeek }`; framework must seed this.
12. **`leagueId` missing** — every link's URL contains `undefined` (current behavior); not great UX but the test should pin it so we notice if it changes.

---

## 6. `leagues.$leagueId.roster._index.tsx`

The Component is `return null;`. The route's job is **redirecting** in the loader. Almost no Component-side render to test; the framework value is asserting redirects.

1. **Component renders nothing** — empty render confirms the placeholder behavior.
2. **Redirect to `/leagues/:leagueId/roster/:selectedRosterId`** — when loader resolves a `selectedRosterId`. Framework should support asserting redirect targets.
3. **Redirect to `/leagues/:leagueId`** — when loader resolves no `selectedRosterId`.
4. **Loader throws** — parent `ErrorBoundary` mounts.

The interesting capability is **redirect assertion** — the framework needs a way to express "given this loader, did it return a `redirect("/somewhere")`?" without trying to render the redirected page.

---

## 7. `leagues.$leagueId.roster.$rosterId.tsx`

`TabRoster` is the largest tab component. Reads parent loader for `{ league, currentUserSleeperId }`. Imperatively navigates via `useNavigate`.

1. **Empty state** — `selectedRoster=null` AND `allRosters.rosters` is empty/missing → renders the "We couldn't find a roster owned by you in this league." section card; no dropdown.
2. **Loading state** — `selectedRoster=null` AND `allRosters.rosters.length > 0` → renders the dropdown but the body shows "Loading roster…".
3. **Starters render** — given `rosterPlayers` with `slotType="starter"`, sorts them by `startingSlotIndex` and renders one `PlayerRow` each, with `slotLabel` derived from `startingSlotPosition` or `rosterPositions[startingSlotIndex]` falling back to `"FLEX"`.
4. **Bench renders** — non-starter / non-reserve / non-taxi players appear in the Bench section with `slotLabel="BN"`.
5. **IR / Reserve section** — only renders if there is at least one `reserve` player.
6. **Taxi Squad section** — only renders if there is at least one `taxi` player.
7. **Roster dropdown** — renders one `SelectItem` per `allRosters.rosters` entry; selecting a value calls `useNavigate` with `/leagues/:leagueId/roster/:newRosterId` and `{ preventScrollReset: true }`.
8. **"My Team" button visibility** — shown only when `userRosterId` exists AND `currentRoster.rosterId !== userRosterId`. String-compared.
9. **"My Team" click** — calls `useNavigate` with `/leagues/:leagueId/roster/:userRosterId`.
10. **`userRosterId` derivation** — found by matching `rosters[i].ownerSleeperUserId === currentUserSleeperId` (string-coerced). With no match, button hidden.
11. **`(You)` suffix in dropdown** — appears only on the user's roster row.
12. **Display name fallback** — `team_name` > `displayName` > `username` > `Team N` (using `sleeperRosterIndex`).
13. **Draft Picks empty** — `draftCapital.byRosterId[<sleeperRosterIndex>]` empty → renders "No draft picks for this roster.".
14. **Draft Picks grouped by season** — picks grouped by `season`, seasons rendered in ascending alphabetic order.
15. **`draftCapital` indexing** — uses `String(currentRoster.sleeperRosterIndex || "")` as key; missing/zero index falls through to empty.
16. **Parent loader read** — `useRouteLoaderData("routes/leagues.$leagueId")` provides `{ league, currentUserSleeperId }`; framework must seed this.
17. **`useParams()` is invoked** — the component calls `useParams()` for side effect (re-render on param change). Framework's `useParams` mock should respect URL changes.

---

## 8. `leagues.$leagueId.standings.tsx`

`TabStandings` renders a standings table. Reads parent loader for `{ league, currentUserSleeperId }`.

1. **Empty rosters** — `allRosters.rosters = []` → "No standings data yet. Sync via the Chrome extension to populate." renders; column headers still visible.
2. **One row per roster** — assert row count and that each row has rank, team name, record, PF, PA cells.
3. **Current user highlight** — row whose `ownerId === currentUserSleeperId` gets the `bg-accent/10` class and a "You" badge.
4. **Record formatting** — `wins-losses` when `ties=0`; `wins-losses-ties` when `ties>0`.
5. **PF formatting** — `points.toFixed(1)`.
6. **PA computation** — `(fpts_against || 0) + (fpts_against_decimal || 0) / 100`, formatted to 1 decimal.
7. **PA = 0** — renders as `—`.
8. **Team name link** — links to `/leagues/:leagueId/roster/:rosterId`.
9. **`leagueId` missing** — link URL contains `undefined`; tests pin current behavior.
10. **Display name fallback** — same chain as in #7 above (team_name > displayName > username > Team N).
11. **Parent loader read** — framework seeds parent loader data containing `{ league, currentUserSleeperId }`.

---

## 9. `leagues.$leagueId.strategy.tsx`

This is the **richest** route for the framework — it has its own `action`, two `useFetcher()` instances, and prefers `actionData` over `loaderData`. It exercises the largest surface area.

### Render branches

1. **No strategy** — `loaderData.strategy = null` → textarea empty; "Not generated yet"; AI placeholder; button label "Generate" (not "Regenerate"); Save button disabled and ghost variant.
2. **Strategy with userNotes only** — textarea pre-filled; AI placeholder still shown; button label "Generate".
3. **Strategy with `aiStrategy`** — `Markdown` rendered with the content; button label "Regenerate".
4. **`strategy.isStale = true`** — amber "Stale — regenerate recommended" badge appears.
5. **`strategy.generatedAt` formatting** — valid date → formatted via `toLocaleString({ month, day, hour, minute })`; invalid/missing → "Not generated yet".

### Local state + dirty tracking

6. **Type into textarea** — local `notes` state diverges from `lastSavedRef`; Save button becomes enabled and switches to default variant.
7. **`useEffect` resets notes when `strategy.userNotes` changes** — simulates "after action returns new strategy, reset local state". Both `notes` state and `lastSavedRef` realign to the new value.
8. **`useEffect` triggers on `updatedAt` change** — even if `userNotes` content is the same, an `updatedAt` change re-syncs local state.

### Fetcher state

9. **`notesFetcher.state = "submitting"`** — Save button disabled, shows "Saving…".
10. **`regenFetcher.state = "submitting"`** — Regenerate button disabled, shows "Generating…", icon has `animate-spin` class.
11. **Both fetchers idle** — buttons show their resting labels.
12. **Two fetchers operate independently** — saving notes does not show the regenerate spinner, and vice versa. Framework must support seeding multiple fetcher mocks keyed by call site (or by hidden form fields).

### Form submission

13. **Save form submission** — submitting `notesFetcher.Form` posts `{ intent: "save-strategy-notes", userNotes: <current value> }` to the route's `action`. Assert that the mocked submit was called with the right body.
14. **Regenerate form submission** — submitting `regenFetcher.Form` posts `{ intent: "regenerate-strategy" }` to the route's `action`.

### `actionData` precedence

15. **`actionData.strategy` overrides `loaderData.strategy`** — when `actionData = { success: true, intent: "save-strategy-notes", strategy: {...new} }`, `TabStrategy` receives the new strategy.
16. **`actionData` without `strategy` field** — falls back to `loaderData.strategy`.
17. **Action error result** — `actionData = { success: false, message }`; current component does not render this, but tests pin behavior so future toast wiring is easy.

### `action` exports

18. **`intent=save-strategy-notes` → `LeagueStrategyService.saveUserNotes` called** — mocked service step is invoked once.
19. **`intent=regenerate-strategy` → `LeagueStrategyService.regenerateStrategy` called** — mocked service step is invoked once.
20. **Unknown intent** — action returns `{ success: false, message: "Unknown intent: …" }`.
21. **Action throws** — caught and returns `{ success: false, message }` with the `Errr` message.

### ErrorBoundary

22. **Loader throws** — parent `ErrorBoundary` mounts.

---

## 10. `leagues.$leagueId.transactions.tsx`

Trivial: `<TabTransactions recentTransactions={...} />`.

1. **Empty list** — `recentTransactions.all = []` → "No transactions yet this season." renders; title is "All Transactions" (no count suffix).
2. **N transactions** — title is `All Transactions · N`; one `TransactionRow` per item; assert each row receives the right `transaction` prop.
3. **`recentTransactions` undefined** — falls back to `{ all: [] }` → empty state renders.
4. **Loader throws** — parent `ErrorBoundary` mounts.

---

## Cross-cutting capability matrix

The scenarios above cluster into a small set of capabilities the framework must provide. Use this matrix when designing the framework — every cell that's "needed" must be expressible in your DSL.

| Capability | Routes that exercise it |
|---|---|
| Seed `loaderData` shape | all |
| Seed `actionData` shape | strategy; (forward-looking: index) |
| Seed parent `loaderData` via `useRouteLoaderData(routeId)` | overview, matchups, roster.$rosterId, standings |
| Seed `useOutletContext()` value | layout (provides), all child tabs (consume) |
| Seed URL `searchParams` initially | index |
| Assert URL `searchParams` after interaction | index |
| Mock `useNavigate` and assert calls | roster.$rosterId |
| Mock project hooks (e.g., `useLeagueRefresh`) | index |
| Mock `useFetcher` (state + Form + submit) | strategy |
| Multiple independent `useFetcher` instances | strategy |
| Fake timers integrated with `act` (debounce) | index |
| Render `ErrorBoundary` export when loader throws | layout, all child tabs |
| Render Component error branch when loader returns `error` field | index, layout |
| Assert loader-returned `redirect(...)` | layout, roster._index |
| Render real children (don't auto-mock) | all |
| Optional spy on a child component's props | index (HeroSpotlightCard), strategy (Markdown), roster.$rosterId (PlayerRow) |
| Drive `<Link>` clicks and assert the resulting URL | matchups, standings |
| Drive form submissions and assert posted form data | strategy, index |

If any cell here can't be expressed cleanly, the framework will fail one of the scenarios above.
