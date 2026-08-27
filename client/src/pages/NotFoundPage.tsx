import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-sm py-24 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/">Back home</Link>
    </div>
  );
}
