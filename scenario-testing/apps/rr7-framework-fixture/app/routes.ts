import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('child', 'routes/child.tsx'),
  route('items', 'routes/items.tsx'),
  route('settings', 'routes/settings.tsx'),
] satisfies RouteConfig;
