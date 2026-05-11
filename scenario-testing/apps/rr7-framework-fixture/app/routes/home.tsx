import { useLoaderData } from 'react-router';
import HomePage from './home/HomePage';

export async function loader() {
  return { title: 'FixtureHome' };
}

export default function Home() {
  const data = useLoaderData() as { title: string };
  return <HomePage title={data.title} />;
}
