import { useLoaderData } from 'react-router';
import ChildPage from './child/ChildPage';

export async function loader() {
  return { label: 'ChildRoute' };
}

export default function Child() {
  const data = useLoaderData() as { label: string };
  return <ChildPage label={data.label} />;
}
