import * as React from 'react';
import { createRoutesStub, Outlet } from 'react-router';

/** Argument type accepted by {@link createRoutesStub} (stub route array). */
export type StubRoutesArg = Parameters<typeof createRoutesStub>[0];

/** One entry in a stub route tree. */
export type StubRouteEntry = StubRoutesArg[number];

/**
 * Layout stub route: supplies `loaderData` addressable via
 * `useRouteLoaderData(parentRouteId)` from any descendant route, and renders an `<Outlet />`.
 *
 * `routeId` must match the string your app passes to `useRouteLoaderData` (e.g. Remix-style `"routes/leagues.$leagueId"`).
 */
export function outletParentRoute(options: {
  routeId: string;
  path: string;
  loaderData: unknown;
  children?: StubRoutesArg;
}): StubRouteEntry {
  const Layout = function OutletLayout() {
    return <Outlet />;
  };
  Layout.displayName = 'OutletLayout';

  return {
    id: options.routeId,
    path: options.path,
    loader: () => options.loaderData,
    Component: Layout,
    children: options.children,
  };
}

/**
 * Leaf stub route with optional loader/action. Prefer explicit `routeId` whenever something may call
 * `useRouteLoaderData(thisRouteId)` or for stable assertion/debug strings.
 */
export function leafRoute(options: {
  routeId: string;
  path?: string;
  index?: boolean;
  Component: React.ComponentType;
  loader?: () => unknown;
  action?: StubRouteEntry['action'];
}): StubRouteEntry {
  const entry = {
    id: options.routeId,
    path: options.path,
    index: options.index,
    Component: options.Component,
    ...(options.loader !== undefined ? { loader: options.loader } : {}),
    ...(options.action !== undefined ? { action: options.action } : {}),
  };
  return entry as StubRouteEntry;
}
