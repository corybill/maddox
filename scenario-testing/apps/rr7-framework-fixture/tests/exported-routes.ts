/**
 * Stable exports for `@scenario-testing/react-router` integration tests.
 */
export { default as Home, loader as homeLoader } from '../app/routes/home';
export { default as Child, loader as childLoader } from '../app/routes/child';
export {
  action as itemsAction,
  default as Items,
  loader as itemsLoader,
} from '../app/routes/items';
export {
  action as settingsAction,
  default as Settings,
  loader as settingsLoader,
} from '../app/routes/settings';
