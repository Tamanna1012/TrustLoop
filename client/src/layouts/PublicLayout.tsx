import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-lg font-semibold text-primary">
          TrustLoop
        </Link>
        {pathname !== '/login' && pathname !== '/register' && (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-foreground-muted hover:text-foreground">
              Log in
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  );
}
