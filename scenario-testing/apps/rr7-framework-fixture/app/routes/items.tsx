import type { ActionFunctionArgs } from 'react-router';
import ItemsPage from './items/ItemsPage';

const DEFAULT_ITEMS = ['Apple', 'Banana', 'Cherry', 'Apricot'];

/** Initial list for dev / non-stub runs. */
export async function loader() {
  return { items: DEFAULT_ITEMS };
}

/**
 * Search intent: filters the demo list (tests normally replace this handler via `createRoutesStub`).
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  if (intent !== 'search') {
    return { error: 'Unknown intent', items: DEFAULT_ITEMS };
  }
  const q = String(formData.get('q') ?? '').trim().toLowerCase();
  const filtered =
    q === ''
      ? DEFAULT_ITEMS
      : DEFAULT_ITEMS.filter((item) => item.toLowerCase().includes(q));
  return { items: filtered, query: q };
}

export default ItemsPage;
