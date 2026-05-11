import { Form, useActionData, useLoaderData } from 'react-router';

export type ItemsLoaderData = { items: string[] };

export type ItemsActionData = {
  items?: string[];
  query?: string;
  error?: string;
};

/**
 * List + search UI: submits to the route `action` via POST. Test stubs replace `action`
 * entirely; results surface through {@link useActionData} (not loader revalidation).
 */
export default function ItemsPage() {
  const { items: loaderItems } = useLoaderData() as ItemsLoaderData;
  const actionData = useActionData() as ItemsActionData | undefined;

  const items = actionData?.items ?? loaderItems;
  const activeQuery =
    actionData && 'query' in actionData ? actionData.query : undefined;

  return (
    <main data-testid="items-page">
      <h1>Items</h1>

      <Form method="post" data-testid="items-search-form">
        <input type="hidden" name="intent" value="search" />
        <label htmlFor="items-q">Search</label>
        <input
          id="items-q"
          type="search"
          name="q"
          data-testid="items-search-input"
          aria-label="Search items"
        />
        <button type="submit">Search</button>
      </Form>

      {activeQuery !== undefined && activeQuery !== '' ? (
        <p data-testid="items-query-label">Results for &quot;{activeQuery}&quot;</p>
      ) : null}

      <ul data-testid="items-list">
        {items.map((item) => (
          <li key={item} data-testid={`item-${item}`}>
            {item}
          </li>
        ))}
      </ul>
    </main>
  );
}
