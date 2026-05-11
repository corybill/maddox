# Prompt: design a Maddox-light scenario testing framework for React Router

> Paste this entire document into the other repo's chat as your kickoff message.
> It is fully self-contained — no cross-repo links are required.

---

## Your task

I am building a **Maddox-light scenario testing framework** for **React Router (v7 / Remix-style flat routes)**. Maddox uses scenario chains (`new Scenarios.X().withFoo().shouldBar().test()`); we want the same ergonomics, but scoped to **React Component testing only**, with loaders, actions, fetchers, and route hooks all mockable inputs.

**Scope of what the framework tests:** the rendered React tree of a route's default Component (and its `ErrorBoundary` export). Loaders/actions/services are not invoked — the framework supplies their *outputs* as test inputs.

Below is a real-world set of routes and the **scenarios this framework must be capable of expressing**. Treat it as the acceptance criteria. Every scenario must be cleanly expressible in your DSL — if it isn't, the framework is incomplete.

## Before you write any code

1. **Read every scenario** in the "Scenarios you must support" section below and group them by the capability they demand.
2. **Build a capability matrix** (see the one I've started in "Capability matrix" below — feel free to refine or rename buckets). For each capability, decide:
   - what primitive the user calls (e.g., `.withLoaderData(...)`, `.withFetcher("notes", { state: "submitting" })`)
   - what mock or stub backs it (e.g., `MemoryRouter`, `vi.mock("react-router")`, fake timers)
   - what assertion shape it returns (`.shouldRender(...)`, `.shouldHaveCalledNavigateWith(...)`, `.shouldRedirectTo(...)`)
3. **Produce a written plan** before writing tests or framework code. The plan must:
   - Enumerate each capability and the API for it.
   - Map every numbered scenario in this document to one or more capabilities.
   - Call out any scenario that does **not** map to an existing capability — that's a gap.
4. **Stop and ask** if any scenario is ambiguous. Don't guess.

I want the categories you choose to be **mutually exclusive and collectively exhaustive** over the scenarios. If two of your buckets both cover the same scenario, merge or refine them.

## Non-goals

- **Don't** invoke real loaders/actions. They're black boxes. Tests supply their resolved values (or simulate them rejecting).
- **Don't** auto-mock child components. Real children render by default; the test opts in to spying on a child's props.
- **Don't** require a real network or browser navigation. URL changes happen in-memory.
- **Don't** reinvent React Testing Library. Wrap it. Reuse it. The DSL sits on top of `@testing-library/react`.

## Conventions to mirror from Maddox

- Chained scenario builder: `new MyScenario().withX(...).withY(...).shouldA(...).shouldB(...).test()`.
- A "scenario" is one pass through the chain. Many small scenarios > one large parameterized one.
- Naming: `Scenarios.<RouteName>.<Behavior>` is OK. Whatever convention you pick, be consistent.
- Inputs (`with*`) come before assertions (`should*`).
- The chain is awaitable; `.test()` returns a promise the test framework awaits.

---

## Scenarios you must support

The scenarios are grouped by route file. Each is a real route with a real rendered tree. **You don't need access to the source** — the scenario descriptions are self-contained and tell you exactly what to seed and what to assert.

### Route inventory (10 routes)

| Route | Renders | Key traits |
|---|---|---|
| `leagues._index` | `<LeaguesDashboard {...loaderData} mode="player" />` (thin wrapper) | own `loader`+`action`; `ErrorBoundary` export; debounced search; URL-driven filters; calls a project hook `useLeagueRefresh` |
| `leagues.$leagueId` | `<LeagueDetailPage>` containing an `<Outlet />` | layout route; provides `{ league, currentNflWeek }` via Outlet context AND via its own loader data (children read it via `useRouteLoaderData("routes/leagues.$leagueId")`); has `ErrorBoundary`; loader can return `redirect(...)` |
| `leagues.$leagueId.overview` | `<TabOverview />` + `<LeagueSettingsTable />` + `<LeagueScoringTable />` | reads parent loader; normalizes object/array shapes |
| `leagues.$leagueId.draft` | `<TabDraft />` | trivial passthrough |
| `leagues.$leagueId.matchups` | `<TabMatchups />` | reads parent loader; week selector via `<Link>` URLs |
| `leagues.$leagueId.roster._index` | `null` | redirect-only route; loader returns `redirect(...)` |
| `leagues.$leagueId.roster.$rosterId` | `<TabRoster />` | reads parent loader; navigates via `useNavigate`; renders selects/buttons |
| `leagues.$leagueId.standings` | `<TabStandings />` | reads parent loader |
| `leagues.$leagueId.strategy` | `<TabStrategy />` | own `action`; consumes `actionData`; **two `useFetcher()` instances** |
| `leagues.$leagueId.transactions` | `<TabTransactions />` | trivial |

---

### 1. `leagues._index`

**Loader returns:** `{ leagues, error, statTiles, availableYears, currentSeason }`.
**Action handles intents:** `refresh`, `link` (default).
**Component:** spreads loaderData into `LeaguesDashboard`. Dashboard reads `useSearchParams()`, calls a hook `useLeagueRefresh()` (returns `{ refresh, isRefreshing }`), debounces search input by 300ms before writing back to `?q=`.

A. Loader-data driven render
1. Happy path: dashboard renders breadcrumb, year switcher, stat banner (4 tiles), spotlight card, league list; subtitle reads `"3 of 3 leagues"`.
2. `error="Sleeper down"` → only breadcrumb + error message render.
3. `leagues=[]` → empty state "none" renders; stat banner / search / spotlight do not.
4. Filters yield no matches → empty state "filtered" renders with a clear-all action.
5. Mixed-status leagues → spotlight is highest priority `drafting > pre_draft > in_season > completed`.
6. Two `pre_draft` leagues — earlier `draftStartTime` becomes spotlight.
7. Two `pre_draft` leagues without `draftStartTime` — smaller `draftDays` wins.
8. Two `completed` leagues — alphabetical sort.
9. Subtitle pluralization & `(filtered)` suffix when query is set.

B. URL / searchParams driven
10. No `?year` param → defaults to `currentSeason` filter.
11. `?year=2025` → only 2025 leagues survive; year switcher reflects active.
12. `?q=dynasty` → case-insensitive name filter.
13. `?status=in_season` → status filter applies.
14. All three combined.

C. `mode` prop branching (the dashboard is reused by a commissioner route)
15. `mode="player"` (default): 4 stat tiles; breadcrumbs `[Leagues]`.
16. `mode="commissioner"`: 2 stat tiles; breadcrumbs `[Commissioner, Leagues]`; title "Your Leagues".

D. Interactions
17. Type "dyn" into search box → advance fake timers 300ms → URL `?q=dyn`. Typing again within 300ms cancels.
18. Externally change `?q` (back-button) → input value updates via the dashboard's `useEffect`.
19. Click a year in switcher → URL gains `?year=...`.
20. Click status filter → `?status=...`. Click again → param removed.
21. Click "Clear all" → `?q` and `?status` removed; `?year` preserved; local search box clears.
22. Click refresh button → mocked `useLeagueRefresh().refresh` called once. With `isRefreshing=true` mock, button shows refreshing state.

E. ErrorBoundary
23. Loader throws → `ErrorBoundary` export mounts (distinct from #2's "loader returned error field").

F. Action round-trip
24. Submit form with `intent=refresh` → action mock invoked with the right form data; resolved `actionData` exposed to component.
25. Action rejects → `actionData={ success:false, message }`.

---

### 2. `leagues.$leagueId` (layout)

Component renders an inline error card if `loaderData.error`; otherwise renders `<LeagueDetailPage>` which itself either renders "League not found." (if no league) or breadcrumb + header + tab bar + `<Outlet />`. Has its own `ErrorBoundary` export and a redirect-on-base-path in the loader.

1. `loaderData.error` truthy → inline error Card; no `LeagueDetailPage`.
2. `league=null` and no error → "League not found" branch (just breadcrumb).
3. League present → breadcrumb, header, tab bar, and Outlet container all render.
4. `leagueId` falls back to `sleeperLeagueId` if `leagueId` missing on the league.
5. Outlet context is `{ league, currentNflWeek }` and is consumable by children rendered inside the Outlet.
6. Children also see this route's loader data via `useRouteLoaderData("routes/leagues.$leagueId")`.
7. Loader throws → exported `ErrorBoundary` mounts (different code path from #1).
8. URL is exactly `/leagues/:leagueId` → loader returns `redirect("/leagues/:leagueId/overview")`. Framework must let the test assert "loader resolved to redirect to X" without rendering the redirected page.

---

### 3. `leagues.$leagueId.overview`

`loaderData = { allRosters, userRoster, nextMatchup, recentTransactions }`. Reads parent route's `league`. Renders `<TabOverview>` + `<LeagueSettingsTable>` + `<LeagueScoringTable>`. Has to handle `league.children.rosterSlots` and `.scoringRules` arriving as either object or array.

1. Happy path render with all sections.
2. `rosterSlots` array → passes through.
3. `rosterSlots` object → `Object.values(...)` then passes through.
4. `rosterSlots` missing → `[]`.
5. `scoringRules` array → passes through.
6. `scoringRules` object → `Object.values(...)`.
7. `scoringRules` missing → `[]`.
8. Parent `league` undefined → renders without throwing, downstream tables receive undefined.
9. `useRouteLoaderData("routes/leagues.$leagueId")` is the seam — framework must seed parent loader data per route id.
10. Loader throws → parent's `ErrorBoundary` mounts (this child route doesn't export its own).

---

### 4. `leagues.$leagueId.draft`

Trivial: renders `<TabDraft draft={...} userDraftPicks={...} />`.

1. Happy path: both children render with the props.
2. `draft=null` → still renders both children.
3. `userDraftPicks=[]` → list child handles empty.
4. Loader throws → parent `ErrorBoundary` mounts.

---

### 5. `leagues.$leagueId.matchups`

`loaderData = { weekMatchups, allRosters }`. Reads parent for `{ league, currentNflWeek }`. `<TabMatchups>` renders an 18-week link selector and a card grid.

1. `weekMatchups.groups=[]` → "No matchups loaded for this week..." message; selector still visible.
2. Active week comes from `weekMatchups.week` if present.
3. Active week falls back to parent's `currentNflWeek` if `weekMatchups` is null.
4. Both null → no link is in active style.
5. Each link's URL is `/leagues/:leagueId?tab=matchups&week=N` for N=1..18.
6. One card per group with two team names + two scores + a week badge.
7. Roster name fallback: `team_name > displayName > username > "Team N"` (where N is `sleeperRosterIndex`).
8. Missing user in `usersById` → falls all the way back to `Team ?`.
9. Score formatting: undefined → `—`; numeric → `.toFixed(1)`.
10. Each team name is a `<Link>` to `/leagues/:leagueId/roster/:rosterId`.
11. `useRouteLoaderData(...)` seam, again.

---

### 6. `leagues.$leagueId.roster._index`

Component is `return null;`. The route's behavior is **redirecting** in the loader.

1. Component renders nothing.
2. Loader resolves a `selectedRosterId` → `redirect("/leagues/:leagueId/roster/:selectedRosterId")`. Assert the redirect target.
3. No `selectedRosterId` → `redirect("/leagues/:leagueId")`. Assert the redirect target.
4. Loader throws → parent `ErrorBoundary`.

This route's value to the framework is the **redirect-assertion primitive**. The test does not actually navigate — it just verifies the loader's resolved value.

---

### 7. `leagues.$leagueId.roster.$rosterId`

`loaderData = { allRosters, selectedRoster, draftCapital }`. Reads parent for `{ league, currentUserSleeperId }`. `<TabRoster>` is the largest tab.

1. Empty state: `selectedRoster=null` AND `allRosters.rosters` empty → "We couldn't find a roster..." card; no dropdown.
2. Loading state: `selectedRoster=null` AND there are rosters → dropdown renders, body shows "Loading roster…".
3. Starters render in `startingSlotIndex` order; `slotLabel = startingSlotPosition || rosterPositions[startingSlotIndex] || "FLEX"`.
4. Bench renders for non-starter / non-reserve / non-taxi players with `slotLabel="BN"`.
5. IR / Reserve section only renders when there's at least one reserve player.
6. Taxi section only renders when there's at least one taxi player.
7. Roster dropdown renders one option per roster; selecting an option calls `useNavigate("/leagues/:leagueId/roster/:newRosterId", { preventScrollReset: true })`.
8. "My Team" button visibility: shown only when `userRosterId` exists AND `currentRoster.rosterId !== userRosterId` (string-compared).
9. "My Team" click → `useNavigate("/leagues/:leagueId/roster/:userRosterId", { preventScrollReset: true })`.
10. `userRosterId` derivation: match `rosters[i].ownerSleeperUserId === currentUserSleeperId`, string-coerced. No match → button hidden.
11. `(You)` suffix in dropdown only on user's roster.
12. Display name fallback chain: `team_name > displayName > username > "Team N"`.
13. Empty draft capital → "No draft picks for this roster.".
14. Draft picks grouped by season; seasons rendered in ascending alphabetical order.
15. `useParams()` is invoked (re-render on param change). Framework's `useParams` mock must respect URL changes.

---

### 8. `leagues.$leagueId.standings`

`loaderData = { allRosters }`. Reads parent for `{ league, currentUserSleeperId }`.

1. `rosters=[]` → empty state; column headers still visible.
2. One row per roster; assert rank, team name, record, PF, PA cells.
3. Current user's row has `bg-accent/10` class and a "You" badge; row matched by `ownerId === currentUserSleeperId`.
4. Record formatting: `W-L` if `ties=0`, else `W-L-T`.
5. PF: `points.toFixed(1)`.
6. PA: `(fpts_against || 0) + (fpts_against_decimal || 0) / 100`, formatted to 1 decimal.
7. PA = 0 → `—`.
8. Team name links to `/leagues/:leagueId/roster/:rosterId`.

---

### 9. `leagues.$leagueId.strategy`

The richest scenario set. `loaderData = { strategy }`. Action handles two intents (`save-strategy-notes`, `regenerate-strategy`). Component prefers `actionData.strategy` over `loaderData.strategy`. `<TabStrategy>` uses **two `useFetcher()` instances** (`notesFetcher`, `regenFetcher`) to drive forms.

A. Render branches
1. `strategy=null` → empty textarea; "Not generated yet"; AI placeholder; button label "Generate"; Save disabled and ghost variant.
2. `strategy.userNotes` only → textarea pre-filled; Generate label.
3. `strategy.aiStrategy` set → `Markdown` rendered; button label "Regenerate".
4. `strategy.isStale=true` → amber "Stale — regenerate recommended" badge.
5. `generatedAt` valid date → formatted; missing/invalid → "Not generated yet".

B. Local state + dirty tracking
6. Type into textarea → Save enabled, default variant.
7. `useEffect` syncs local state when `strategy.userNotes` changes (e.g., after action returns new strategy).
8. `useEffect` also syncs on `strategy.updatedAt` change (even if content same).

C. Fetcher state
9. `notesFetcher.state="submitting"` → Save disabled, label "Saving…".
10. `regenFetcher.state="submitting"` → Regenerate disabled, label "Generating…", icon `animate-spin`.
11. Both idle → resting labels.
12. **Two fetchers operate independently** — saving notes does not show regenerate spinner. Framework must seed multiple fetcher mocks keyed somehow (per call site or per hidden form `intent`).

D. Form submission
13. Submit `notesFetcher.Form` → posts `{ intent: "save-strategy-notes", userNotes: <current> }` to action mock.
14. Submit `regenFetcher.Form` → posts `{ intent: "regenerate-strategy" }`.

E. `actionData` precedence
15. `actionData.strategy` overrides `loaderData.strategy`.
16. `actionData` without `strategy` field → falls back to `loaderData.strategy`.
17. `actionData={ success:false, message }` → no current render impact, but assert the rendered tree for stability.

F. Action exports
18. `intent=save-strategy-notes` → service step `saveUserNotes` invoked once.
19. `intent=regenerate-strategy` → service step `regenerateStrategy` invoked once.
20. Unknown intent → `{ success:false, message:"Unknown intent: …" }`.
21. Action throws → `{ success:false, message }`.

G. ErrorBoundary
22. Loader throws → parent's `ErrorBoundary` mounts.

---

### 10. `leagues.$leagueId.transactions`

Trivial.

1. `recentTransactions.all=[]` → "No transactions yet this season." renders; title is "All Transactions" (no count suffix).
2. N transactions → title `All Transactions · N`; one `TransactionRow` per item; assert each row receives the right `transaction` prop.
3. `recentTransactions` undefined → falls back to `{ all: [] }` → empty state.

---

## Capability matrix (starter — refine as you plan)

Every cell that's "needed" must be expressible cleanly in your DSL. If a cell isn't, the framework is incomplete.

| Capability | Sample API I'd expect | Routes that exercise it |
|---|---|---|
| Seed `loaderData` | `.withLoaderData({...})` | all |
| Seed `actionData` | `.withActionData({...})` | strategy, leagues._index |
| Seed parent `loaderData` keyed by route id (for `useRouteLoaderData`) | `.withParentLoaderData("routes/leagues.$leagueId", {...})` | overview, matchups, roster.$rosterId, standings |
| Seed `useOutletContext()` value | `.withOutletContext({...})` | layout (provides), tabs (consume) |
| Seed initial URL `pathname` + `searchParams` | `.withUrl("/leagues?year=2025&q=foo")` | leagues._index |
| Assert URL `searchParams` after interaction | `.shouldHaveSearchParams({ year: "2025" })` | leagues._index |
| Mock `useNavigate` and assert calls | `.shouldHaveNavigatedTo("/leagues/X/roster/Y", { preventScrollReset: true })` | roster.$rosterId |
| Mock `useParams` (and update on URL change) | implicit when URL changes | roster.$rosterId |
| Mock project hooks | `.withHook("useLeagueRefresh", { refresh: spy, isRefreshing: false })` | leagues._index |
| Mock `useFetcher` per call site | `.withFetcher("notes", { state: "idle" })` (key derived from form's `intent` or call order) | strategy |
| Multiple independent `useFetcher` instances | same as above, multiple calls | strategy |
| Fake timers integrated with `act` (debounce-friendly) | `.advanceTimersBy(300)` | leagues._index |
| Render `ErrorBoundary` export when loader throws | `.whenLoaderRejects(err)` selects the ErrorBoundary path | layout, all child tabs |
| Render Component error branch when loader returns `error` field | `.withLoaderData({ error: "..." })` | leagues._index, layout |
| Assert loader-returned `redirect(...)` (no actual nav) | `.shouldRedirectTo("/leagues/123/overview")` | layout, roster._index |
| Render real children (no auto-mock) | default behavior | all |
| Optional spy on a child component's props | `.spyOnChild(HeroSpotlightCard).shouldHaveReceived({ league: { leagueId: 42 } })` | leagues._index, strategy, roster.$rosterId |
| Drive `<Link>` clicks and assert URL change | `.click("text=W7").shouldBeAt("/leagues/123?tab=matchups&week=7")` | matchups, standings |
| Drive form submissions and assert posted form data | `.submitForm({ within: "Save" }).shouldHavePostedToAction({ intent: "save-strategy-notes", userNotes: "abc" })` | strategy, leagues._index |
| Drive controlled input + fake timers (debounce) | `.type("[role=searchbox]", "dyn").advanceTimersBy(300)` | leagues._index |

You are free to rename, merge, or split these. The goal is a small, orthogonal API where every scenario above maps to ≤3 capabilities and reads naturally as English.

## Suggested categorization framing

When you produce your plan, I want the capabilities organized into roughly these **four buckets** (or whatever cleaner categorization you derive — but whatever you pick must cover everything):

1. **Inputs to render** — `loaderData`, `actionData`, parent loader data, outlet context, initial URL, hook return values, fetcher state. These are seeded *before* render.
2. **Routing primitives that must be faked** — `useSearchParams`, `useNavigate`, `useParams`, `useRouteLoaderData`, `useOutletContext`, `useFetcher`, `<Link>`, `<Outlet>`. The framework must intercept all of them.
3. **Drivers (interactions)** — typing, clicking, submitting forms, advancing timers, simulating external URL changes (back button).
4. **Assertions** — DOM presence/absence/text, URL state, navigate calls, fetcher submissions, redirect targets, which export mounted (Component vs ErrorBoundary), child-component prop spies.

If your plan can't articulate the API in these four buckets (or your equivalent), that's a smell.

## Deliverables I expect from you (in order)

1. **Plan document** with: API sketch, capability matrix mapped to scenarios, list of any unsupported scenarios.
2. **Framework skeleton** — the core scenario builder, mock providers, and assertion helpers.
3. **One worked example** — implement the framework against the simplest route (`leagues.$leagueId.transactions`, scenarios 1–3) to demonstrate the DSL.
4. **A second worked example** — implement the framework against the richest route (`leagues.$leagueId.strategy`, scenarios 1–22) to prove multi-fetcher, actionData precedence, and form submissions work.
5. **Document any scenario you couldn't express** and propose what would change in the framework to support it.

Do not skip step 1. Plans first, code second.

## Stylistic guidance

- **Chain ergonomics.** Names should read like sentences. Prefer `.shouldRender(<Heading text="Standings" />)` over `.shouldRenderHeading("Standings")` — the former is composable with any DOM matcher.
- **Defaults that work.** `withLoaderData({})` should not crash. `withParentLoaderData(id, {})` should be opt-in.
- **Fail loudly.** If a test renders without seeding `useRouteLoaderData` and the component reads it, the framework should throw with a useful message ("scenario read parent loader for `routes/leagues.$leagueId` but none was seeded; call `.withParentLoaderData(...)`").
- **No magic globals.** Each scenario is independent. No shared state between scenarios.
- **`act` is internal.** Users never type `act(...)`. The framework wraps it.

That's the brief. Ask me anything before you start — but lead with your plan and your capability bucketing.
