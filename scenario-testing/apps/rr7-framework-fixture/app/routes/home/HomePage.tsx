import { Link } from 'react-router';

export type HomePageProps = {
  title: string;
};

export default function HomePage({ title }: HomePageProps) {
  return (
    <main>
      <h1 data-testid="home-title">{title}</h1>
      <nav aria-label="Fixture routes">
        <ul>
          <li>
            <Link to="/child" data-testid="nav-child">
              Child
            </Link>
          </li>
          <li>
            <Link to="/items" data-testid="nav-items">
              Items (search action)
            </Link>
          </li>
          <li>
            <Link to="/settings" data-testid="nav-settings">
              Settings (save action)
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
