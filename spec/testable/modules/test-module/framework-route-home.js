import { createElement } from 'react';
import { useLoaderData } from 'react-router';
import Service from './test-module-service.js';

export async function loader(args) {
  const req = {
    params: args.params,
    query: Object.fromEntries(new URL(args.request.url).searchParams)
  };

  return await Service.executeWithStatelessEs6Proxy(req.params, req.query);
}

export default function PersonView() {
  const data = useLoaderData();
  return createElement('p', { 'data-testid': 'person' }, `LastName: ${data.lastName}`);
}