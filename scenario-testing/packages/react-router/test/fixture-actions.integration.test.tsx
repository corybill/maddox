/**
 * RR7 fixture routes: Items (search → action → useActionData) and Settings (save → action).
 *
 * Layout matches Maddox-style specs: `context.setupValues` → `context.setupInputParams` → … →
 * `context.setupResponse`, then the RouteScenario chain. Use `context.*Params` for
 * `shouldBeCalledWith` / mock inputs and `context.*Response` for mock return payloads.
 *
 * Action outcomes read via `useActionData()` are asserted with Testing Library (no separate
 * `doesReturn` helper).
 */
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';
import {
  Items,
  Settings,
} from '@scenario-testing/rr7-framework-fixture/tests/exported-routes';
import { createRouteScenario, type RouteScenario } from '../src/index.js';
import type { StepContext } from '../src/step-context.js';

describe('Given the RR7 fixture Items route, when', function () {
  describe('submitting the search form, it', function () {
    let context: {
      scenario?: RouteScenario;
      initialEntries: string[];
      loaderItems: string[];
      itemsSearchParams: { intent: string; q: string }[];
      itemsSearchResponse: { items: string[]; query: string };
      expectedQueryLabel: RegExp;
      expectedPresentItemTestId: string;
      expectedAbsentItemTestId: string;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupItemsSearch: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        initialEntries: ['/items'],
        loaderItems: ['Apple', 'Banana', 'Cherry'],
        itemsSearchParams: [{ intent: 'search', q: 'b' }],
        itemsSearchResponse: { items: ['Banana'], query: 'b' },
        expectedQueryLabel: /Results for "b"/,
        expectedPresentItemTestId: 'item-Banana',
        expectedAbsentItemTestId: 'item-Apple',
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          /* initialEntries / loaderItems defaults set on context object */
        },
        setupItemsSearch: function () {
          /* itemsSearchParams + itemsSearchResponse already defaulted */
        },
        setupStubRoutes: function () {
          context.scenario!.mockThisFunction('fixture', 'itemsSearch', () => context.itemsSearchResponse);
          const itemsSearch = context.scenario!.mocks.getMock('fixture', 'itemsSearch')!;
          context.scenario!.withStubRoutes({
            routes: [
              {
                id: 'routes/items',
                path: '/items',
                Component: Items,
                loader: function () {
                  return { items: context.loaderItems };
                },
                HydrateFallback: function () {
                  return null;
                },
                action: async function ({ request }) {
                  const fd = await request.formData();
                  return itemsSearch({
                    intent: fd.get('intent'),
                    q: fd.get('q'),
                  });
                },
              },
            ],
            initialEntries: context.initialEntries,
          });
        },
        setupResponse: function () {
          /* expectedQueryLabel / DOM expectations defaulted */
        },
      };
    });

    it('filters the list using the mocked action return', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupItemsSearch();
      context.setupStubRoutes();
      context.setupResponse();

      await context.scenario!
        .shouldBeCalledWith('fixture', 'itemsSearch', 0, context.itemsSearchParams)
        .step(async function ({ screen, userEvent }: StepContext) {
          const input = await screen.findByTestId('items-search-input');
          await userEvent.clear(input);
          await userEvent.type(input, 'b');
          await userEvent.click(screen.getByRole('button', { name: /^search$/i }));
        })
        .step(async function ({ screen }: StepContext) {
          await waitFor(function () {
            expect(screen.getByTestId('items-query-label')).toHaveTextContent(context.expectedQueryLabel);
          });
          expect(screen.getByTestId(context.expectedPresentItemTestId)).toBeInTheDocument();
          expect(screen.queryByTestId(context.expectedAbsentItemTestId)).not.toBeInTheDocument();
        })
        .run();
    });
  });
});

describe('Given the RR7 fixture Settings route, when', function () {
  describe('submitting the save form, it', function () {
    let context: {
      scenario?: RouteScenario;
      initialEntries: string[];
      settingsSaveParams: { intent: string; note: string }[];
      settingsSaveResponse: { ok: boolean; savedNote: string };
      expectedSavedBannerText: string;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupSettingsSave: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        initialEntries: ['/settings'],
        settingsSaveParams: [{ intent: 'save', note: 'hello ui' }],
        settingsSaveResponse: { ok: true, savedNote: 'stored-note' },
        expectedSavedBannerText: 'stored-note',
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          /* defaults */
        },
        setupSettingsSave: function () {
          /* settingsSaveParams + settingsSaveResponse already defaulted */
        },
        setupStubRoutes: function () {
          context.scenario!.mockThisFunction('fixture', 'settingsSave', () => context.settingsSaveResponse);
          const settingsSave = context.scenario!.mocks.getMock('fixture', 'settingsSave')!;
          context.scenario!.withStubRoutes({
            routes: [
              {
                id: 'routes/settings',
                path: '/settings',
                Component: Settings,
                loader: function () {
                  return { draft: '' };
                },
                HydrateFallback: function () {
                  return null;
                },
                action: async function ({ request }) {
                  const fd = await request.formData();
                  return settingsSave({
                    intent: fd.get('intent'),
                    note: fd.get('note'),
                  });
                },
              },
            ],
            initialEntries: context.initialEntries,
          });
        },
        setupResponse: function () {
          /* expectedSavedBannerText defaulted */
        },
      };
    });

    it('shows the mocked action return in the success banner', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupSettingsSave();
      context.setupStubRoutes();
      context.setupResponse();

      await context.scenario!
        .shouldBeCalledWith('fixture', 'settingsSave', 0, context.settingsSaveParams)
        .step(async function ({ screen, userEvent }: StepContext) {
          const note = await screen.findByTestId('settings-note');
          await userEvent.clear(note);
          await userEvent.type(note, 'hello ui');
          await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
        })
        .step(async function ({ screen }: StepContext) {
          await waitFor(function () {
            expect(screen.getByTestId('settings-saved-banner')).toHaveTextContent(context.expectedSavedBannerText);
          });
        })
        .run();
    });
  });
});
