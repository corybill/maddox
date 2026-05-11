import * as React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { TestContext } from 'vitest';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import {
  Child,
  Home,
} from '@scenario-testing/rr7-framework-fixture/tests/exported-routes';
import {
  createRouteScenario,
  leafRoute,
  outletParentRoute,
  type RouteScenario,
  type StubRouteOptions,
} from '../src/index.js';
import type { StepContext } from '../src/step-context.js';

function DogfoodFormRoute() {
  const { submit } = useLoaderData() as {
    submit: (body: { text: string }) => void;
  };
  return (
    <>
      <input data-testid="field" />
      <button
        type="button"
        data-testid="submit"
        onClick={() => {
          const input = document.querySelector(
            '[data-testid="field"]'
          ) as HTMLInputElement;
          submit({ text: input.value });
        }}
      >
        Save
      </button>
    </>
  );
}

describe('Given @scenario-testing/react-router dogfood, when', function () {
  describe('rendering with createRoutesStub, it', function () {
    let context: {
      scenario?: RouteScenario;
      stubOptions: StubRouteOptions;
      expectedHomeTitle: string;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        stubOptions: { routes: [], initialEntries: ['/'] },
        expectedHomeTitle: 'ScenarioOverride',
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          context.stubOptions = {
            routes: [
              {
                path: '/',
                Component: Home,
                loader: function () {
                  return { title: 'ScenarioOverride' };
                },
              },
            ],
            initialEntries: ['/'],
          };
        },
        setupStubRoutes: function () {
          context.scenario!.withStubRoutes(context.stubOptions);
        },
        setupResponse: function () {
          /* expectedHomeTitle */
        },
      };
    });

    it('uses stub loader data on the Home route', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupStubRoutes();
      context.setupResponse();

      const { unmount } = context.scenario!.render();

      await waitFor(function () {
        expect(screen.getByTestId('home-title')).toHaveTextContent(context.expectedHomeTitle);
      });
      unmount();
    });
  });

  describe('navigating via stub routes, it', function () {
    let context: {
      scenario?: RouteScenario;
      stubOptions: StubRouteOptions;
      expectedChildLabel: string;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        stubOptions: { routes: [], initialEntries: ['/child'] },
        expectedChildLabel: 'MockedChild',
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          context.stubOptions = {
            routes: [
              {
                path: '/',
                Component: Home,
                loader: function () {
                  return { title: 'Home' };
                },
              },
              {
                path: '/child',
                Component: Child,
                loader: function () {
                  return { label: 'MockedChild' };
                },
              },
            ],
            initialEntries: ['/child'],
          };
        },
        setupStubRoutes: function () {
          context.scenario!.withStubRoutes(context.stubOptions);
        },
        setupResponse: function () {
          /* expectedChildLabel */
        },
      };
    });

    it('mounts the Child route when initialEntries match /child', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupStubRoutes();
      context.setupResponse();

      const { unmount } = context.scenario!.render();

      await waitFor(function () {
        expect(screen.getByTestId('child-label')).toHaveTextContent(context.expectedChildLabel);
      });
      unmount();
    });
  });

  describe('recording mocks from the loader, it', function () {
    let context: {
      scenario?: RouteScenario;
      stubOptions: StubRouteOptions;
      expectedTitleFromMock: string;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupFetchTitleMock: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        stubOptions: { routes: [], initialEntries: ['/'] },
        expectedTitleFromMock: 'FromMock',
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          context.stubOptions = {
            routes: [
              {
                path: '/',
                Component: Home,
                loader: function () {
                  const fetchTitle = context.scenario!.mocks.getMock('api', 'fetchTitle')!;
                  return { title: fetchTitle() as string };
                },
              },
            ],
            initialEntries: ['/'],
          };
        },
        setupFetchTitleMock: function () {
          context.scenario!.mockThisFunction('api', 'fetchTitle', function () {
            return 'FromMock';
          });
        },
        setupStubRoutes: function () {
          context.scenario!.withStubRoutes(context.stubOptions);
        },
        setupResponse: function () {
          /* expectedTitleFromMock */
        },
      };
    });

    it('invokes mockThisFunction from loader output', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupFetchTitleMock();
      context.setupStubRoutes();
      context.setupResponse();

      const { unmount } = context.scenario!.render();

      await waitFor(function () {
        expect(screen.getByTestId('home-title')).toHaveTextContent(context.expectedTitleFromMock);
      });
      expect(context.scenario!.mocks.callCount('api', 'fetchTitle')).toBe(1);
      unmount();
    });
  });

  describe('running ordered steps and verifyMocks, it', function () {
    let context: {
      scenario?: RouteScenario;
      submitParams: { text: string }[];
      stubOptions: StubRouteOptions;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupSubmitMock: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        submitParams: [{ text: 'hello' }],
        stubOptions: { routes: [], initialEntries: ['/'] },
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          context.stubOptions = {
            routes: [
              {
                path: '/',
                Component: DogfoodFormRoute,
                loader: function () {
                  return {
                    submit: context.scenario!.mocks.getMock('api', 'submit')!,
                  };
                },
              },
            ],
            initialEntries: ['/'],
          };
        },
        setupSubmitMock: function () {
          context.scenario!.mockThisFunction('api', 'submit');
        },
        setupStubRoutes: function () {
          context.scenario!.withStubRoutes(context.stubOptions);
        },
        setupResponse: function () {},
      };
    });

    it('records submit args via shouldBeCalledWith', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupSubmitMock();
      context.setupStubRoutes();
      context.setupResponse();

      await context.scenario!.shouldBeCalledWith('api', 'submit', 0, context.submitParams).step('type in field', async function ({ screen, userEvent }: StepContext) {
        const field = await screen.findByTestId('field');
        await userEvent.type(field, 'hello');
      }).step('click save', async function ({ screen, userEvent }: StepContext) {
        await userEvent.click(await screen.findByTestId('submit'));
      }).run();
    });
  });

  describe('reading parent loader data from a nested stub, it', function () {
    let context: {
      scenario?: RouteScenario;
      parentRouteId: string;
      stubOptions: StubRouteOptions;
      setupValues: (ctx: TestContext) => void;
      setupInputParams: () => void;
      setupStubRoutes: () => void;
      setupResponse: () => void;
    };

    beforeEach(function () {
      context = {
        parentRouteId: 'routes/leagues.parent',
        stubOptions: { routes: [], initialEntries: ['/leagues/99/overview'] },
        setupValues: function (ctx: TestContext) {
          context.scenario = createRouteScenario(ctx);
        },
        setupInputParams: function () {
          function ChildOverview() {
            const parent = useRouteLoaderData(context.parentRouteId) as {
              leagueName: string;
            };
            const local = useLoaderData() as { tab: string };
            return (
              <div data-testid="wrap">
                <span data-testid="parent-league">{parent.leagueName}</span>
                <span data-testid="tab">{local.tab}</span>
              </div>
            );
          }

          context.stubOptions = {
            routes: [
              outletParentRoute({
                routeId: context.parentRouteId,
                path: '/leagues/:leagueId',
                loaderData: { leagueName: 'West' },
                children: [
                  leafRoute({
                    routeId: 'routes/leagues.overview',
                    path: 'overview',
                    Component: ChildOverview,
                    loader: function () {
                      return { tab: 'overview' };
                    },
                  }),
                ],
              }),
            ],
            initialEntries: ['/leagues/99/overview'],
          };
        },
        setupStubRoutes: function () {
          context.scenario!.withStubRoutes(context.stubOptions);
        },
        setupResponse: function () {},
      };
    });

    it('exposes parent loader data to the child route', async function (ctx) {
      context.setupValues(ctx);
      context.setupInputParams();
      context.setupStubRoutes();
      context.setupResponse();

      const { unmount } = context.scenario!.render();

      await waitFor(function () {
        expect(screen.getByTestId('parent-league')).toHaveTextContent('West');
        expect(screen.getByTestId('tab')).toHaveTextContent('overview');
      });
      unmount();
    });
  });
});
